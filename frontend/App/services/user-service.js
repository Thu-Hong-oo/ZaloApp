import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService from './token-service';
import { config } from '../config/config';
// URL có thể tùy chỉnh theo thiết bị

/**
 * Cấu hình API Gateway
 * - Sử dụng localhost cho Expo Web
 * - Sử dụng 10.0.2.2 cho Android emulator
 * - Sử dụng localhost cho iOS simulator
 * - Sử dụng IP thật cho thiết bị thật
 */

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 30000,
  headers: {
      'Content-Type': 'application/json',
  }
});


// Thêm interceptor để log request
api.interceptors.request.use(
  config => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để log response
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    return Promise.reject(error);
  }
);
// Các hàm dịch vụ người dùng
const UserService = {
  constructor() {
    this.api = axios.create({
      baseURL: `${config.API_URL}/api`,
      timeout: 30000,
    });
  },

  async register(userData) {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  async getProfile() {
    try {
      const token = await TokenService.getAccessToken();
      const response = await api.get('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /**
   * Cập nhật thông tin profile người dùng
   * @param {Object} userData - Thông tin cần cập nhật
   * @returns {Promise} Kết quả cập nhật
   */
  async updateProfile(userData) {
    try {
      const token = await TokenService.getAccessToken();
      
      // Chỉ gửi trường name
      const updateData = {
        name: userData.name
      };

      const response = await api.put('/users/profile', updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  /**
   * Upload avatar
   * @param {FormData} formData - Form data chứa file avatar
   * @returns {Promise} Kết quả upload
   */
  async uploadAvatar(formData) {
    try {
      const token = await TokenService.getAccessToken();
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error.response?.data || error;
    }
  }
};

export default UserService;
