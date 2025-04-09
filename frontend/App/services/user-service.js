import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService from './token-service';

// URL có thể tùy chỉnh theo thiết bị
const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url.includes('/auth/')) return config;

    const token = await TokenService.getFormattedToken();
    if (token) {
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    } else {
      throw new Error('No authentication token available');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý refresh token khi access token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await TokenService.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        if (response.data?.accessToken) {
          await TokenService.saveTokens(response.data.accessToken, response.data.refreshToken || refreshToken);
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        await TokenService.removeTokens();
        throw new Error('Authentication failed. Please login again.');
      }
    }

    return Promise.reject(error);
  }
);

// Các hàm dịch vụ người dùng
const UserService = {
  async register(userData) {
    try {
      const response = await axiosInstance.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  async getProfile() {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  async updateProfile(userData) {
    try {
      const token = await TokenService.getAccessToken();
      if (!token) throw new Error('No access token available');
  
      let avatarUrl = userData.avatar;
  
      // Kiểm tra xem avatar có phải là object (ảnh mới) hay không
      if (userData.avatar && (typeof userData.avatar === 'object' || typeof userData.avatar === 'string' && userData.avatar.startsWith('data:'))) {
        // Tạo FormData
        const formData = new FormData();
        
        // Xử lý data URI (base64)
        if (typeof userData.avatar === 'string' && userData.avatar.startsWith('data:')) {
          // Parse data URI
          const matches = userData.avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          
          if (matches && matches.length === 3) {
            const type = matches[1];
            const base64Data = matches[2];
            const extension = type.split('/')[1];
            const fileName = `avatar.${extension}`;
            
            // Trong React Native Web, tạo một Blob từ base64
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            for (let i = 0; i < byteCharacters.length; i += 512) {
              const slice = byteCharacters.slice(i, i + 512);
              
              const byteNumbers = new Array(slice.length);
              for (let j = 0; j < slice.length; j++) {
                byteNumbers[j] = slice.charCodeAt(j);
              }
              
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, {type});
            const file = new File([blob], fileName, {type});
            
            console.log('Converted base64 to File object:', {
              name: fileName,
              type: type,
              size: file.size
            });
            
            formData.append('avatar', file);
          } else {
            throw new Error('Invalid data URI format');
          }
        } 
        // Xử lý object avatar (uri thông thường)
        else if (typeof userData.avatar === 'object' && userData.avatar.uri) {
          // Xác định loại MIME từ uri
          let fileType = userData.avatar.type || 'image/jpeg';
          let fileName = userData.avatar.name || 'avatar.jpg';
          
          // Xử lý URI là data URL
          if (userData.avatar.uri.startsWith('data:')) {
            const matches = userData.avatar.uri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            
            if (matches && matches.length === 3) {
              const type = matches[1];
              const base64Data = matches[2];
              const extension = type.split('/')[1];
              fileName = `avatar.${extension}`;
              fileType = type;
              
              // Trong React Native Web, tạo một Blob từ base64
              const byteCharacters = atob(base64Data);
              const byteArrays = [];
              
              for (let i = 0; i < byteCharacters.length; i += 512) {
                const slice = byteCharacters.slice(i, i + 512);
                
                const byteNumbers = new Array(slice.length);
                for (let j = 0; j < slice.length; j++) {
                  byteNumbers[j] = slice.charCodeAt(j);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
              }
              
              const blob = new Blob(byteArrays, {type: fileType});
              const file = new File([blob], fileName, {type: fileType});
              
              console.log('Converted URI base64 to File object:', {
                name: fileName,
                type: fileType,
                size: file.size
              });
              
              formData.append('avatar', file);
            } else {
              throw new Error('Invalid data URI format in avatar object');
            }
          } else {
            // Log để debug
            console.log('Uploading image with data:', {
              uri: userData.avatar.uri,
              type: fileType,
              name: fileName
            });
            
            // Nếu chạy trên Web, cần xử lý khác với React Native
            if (typeof window !== 'undefined' && window.File && userData.avatar instanceof File) {
              formData.append('avatar', userData.avatar);
            } else {
              // Thêm file vào formData (cách React Native)
              formData.append('avatar', {
                uri: userData.avatar.uri,
                type: fileType,
                name: fileName
              });
            }
          }
        }
  
        try {
          // Gửi request tải lên ảnh
          const uploadResponse = await fetch(`${API_URL}/users/avatar`, {
            method: 'PUT',
            body: formData,
            headers: {
              'Authorization': `Bearer ${token}`,
              // KHÔNG set 'Content-Type' để boundary tự động được thiết lập
            },
          });
          
          // Log response để debug
          const responseText = await uploadResponse.text();
          console.log('Upload response:', responseText);
          
          // Parse response JSON
          let responseData = {};
          try {
            responseData = responseText ? JSON.parse(responseText) : {};
          } catch (e) {
            console.error('Failed to parse response JSON:', e);
            throw new Error('Server response format error');
          }
          
          // SỬA: Kiểm tra avatarUrl thay vì url trong phản hồi
          if (uploadResponse.ok && responseData.avatarUrl) {
            avatarUrl = responseData.avatarUrl;
          } else {
            throw new Error(responseData.error || 'Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw new Error('Lỗi khi tải ảnh lên: ' + uploadError.message);
        }
      }
  
      // Cập nhật thông tin profile
      const profileData = {
        fullName: userData.fullName,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        avatar: avatarUrl,
        phoneNumber: userData.phoneNumber
      };
  
      const response = await axiosInstance.put('/users/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response ? error.response.data : error;
    }
  }
};

export default UserService;
