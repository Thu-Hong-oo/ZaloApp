import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService from './token-service';

/**
 * Cấu hình API Gateway
 * - 10.0.2.2 là localhost cho Android emulator
 * - localhost cho iOS simulator
 * - IP thật cho thiết bị thật
 */
//const API_URL = 'http://10.0.2.2:8000/api';  // 10.0.2.2 là localhost cho Android emulator
 const API_URL = 'http://localhost:3000/api'; 
// const API_URL = 'http://192.168.1.163:8000/api';  // Cho thiết bị thật

/**
 * Cấu hình axios với timeout và headers mặc định
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('Request config before token:', config);
    
    // Không thêm token cho các route authentication
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    const token = await TokenService.getFormattedToken();
    if (token) {
      console.log('Using token for request:', token);
      // Đảm bảo token được gửi đúng format
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    } else {
      console.log('No token available for request');
      throw new Error('No authentication token available');
    }
    
    console.log('Final request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi 401
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Attempting to refresh token for request:', originalRequest);
      
      try {
        const refreshToken = await TokenService.getRefreshToken();
        console.log('Using refresh token:', refreshToken);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Sửa endpoint và format request refresh token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}` // Thêm refresh token vào header
          }
        });
        
        console.log('Refresh token response:', response.data);
        
        if (response.data?.accessToken) {
          console.log('Token refresh successful, new token:', response.data.accessToken);
          await TokenService.saveTokens(response.data.accessToken, response.data.refreshToken || refreshToken);
          
          // Update the failed request with new token
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          console.log('Retrying original request with new token');
          return axiosInstance(originalRequest);
        } else {
          console.error('Invalid refresh token response:', response.data);
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        if (refreshError.response) {
          console.error('Refresh token error details:', {
            status: refreshError.response.status,
            data: refreshError.response.data,
            url: refreshError.config?.url,
            method: refreshError.config?.method
          });
        }
        await TokenService.removeTokens();
        throw new Error('Authentication failed. Please login again.');
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Service xử lý các API liên quan đến người dùng
 */
const UserService = {
  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Thông tin người dùng cần đăng ký
   * @returns {Promise} - Kết quả đăng ký
   */
  async register(userData) {
    try {
      const response = await axiosInstance.post('/users/register', userData);
      return response.data; // Trả về dữ liệu thành công từ API
    } catch (error) {
      console.error('Error registering user:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Lấy thông tin profile người dùng
   * @returns {Promise} - Thông tin profile người dùng
   */
  async getProfile() {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data; // Trả về thông tin profile người dùng
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Thông tin cần cập nhật
   * @returns {Promise} - Dữ liệu người dùng sau khi cập nhật
   */
  async updateProfile(userData) {
    try {
      console.log('Updating profile with data:', userData);
      console.log('Request URL:', `${API_URL}/users/profile`);
      
      const response = await axiosInstance.put('/users/profile', userData);
      
      if (response.data) {
        console.log('Profile update successful:', response.data);
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Thay đổi mật khẩu người dùng
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise} - Thông báo thành công
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data; // Trả về thông báo thành công
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Tải ảnh đại diện lên
   * @param {File} file - File ảnh đại diện
   * @returns {Promise} - URL của avatar đã tải lên
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axiosInstance.put('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Quan trọng khi gửi file
        }
      });
      return response.data; // Trả về URL của avatar đã tải lên
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Tìm kiếm người dùng
   * @returns {Promise} - Danh sách người dùng
   */
  async searchUsers() {
    try {
      const response = await axiosInstance.get('/users/search');
      return response.data; // Trả về danh sách người dùng
    } catch (error) {
      console.error('Error searching users:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Lấy thông tin người dùng theo số điện thoại
   * @param {string} phone - Số điện thoại cần tìm
   * @returns {Promise} - Thông tin người dùng
   */
  async getUserByPhone(phone) {
    try {
      const response = await axiosInstance.get(`/users/phone/${phone}`);
      return response.data; // Trả về thông tin người dùng
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      throw error.response ? error.response.data : error;
    }
  }
}

export default UserService;
