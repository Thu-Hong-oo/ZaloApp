import axios from 'axios';
import { API_URL } from '../config';
import TokenService from './token-service';

/**
 * Cấu hình API Gateway
 * - Sử dụng localhost cho Expo Web
 * - Sử dụng 10.0.2.2 cho Android emulator
 * - Sử dụng localhost cho iOS simulator
 * - Sử dụng IP thật cho thiết bị thật
 */
const API_URL_AUTH = `${API_URL}/api/auth`;

/**
 * Cấu hình axios với timeout và headers mặc định
 */
const axiosInstance = axios.create({
  baseURL: API_URL_AUTH,
  timeout: 30000, // Tăng timeout lên 30 giây
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor để log request
axiosInstance.interceptors.request.use(
  config => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để log response
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

/**
 * Service xử lý các API liên quan đến xác thực
 */
class AuthService {
  constructor() {
    this.api = axiosInstance;
  }

  /**
   * Đăng nhập
   * @param {string} phoneNumber - Số điện thoại đăng nhập
   * @param {string} password - Mật khẩu đăng nhập
   * @returns {Promise} - Kết quả đăng nhập
   */
  async login(credentials) {
    try {
      console.log('Login request:', credentials);
      const response = await this.api.post('/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Lưu tokens
        await TokenService.saveTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        
        return response.data;
      } else {
        throw new Error(response.data.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Đăng ký
   * @param {Object} userData - Thông tin người dùng cần đăng ký
   * @returns {Promise} - Kết quả đăng ký
   */
  async register(userData) {
    try {
      // Transform phoneNumber to phone if it exists
      const transformedData = {
        ...userData,
        phone: userData.phoneNumber,
      };
      // Remove phoneNumber to avoid confusion
      delete transformedData.phoneNumber;

      console.log('Sending register request with:', transformedData);
      const response = await this.api.post('/register', transformedData);
      if (response.data.success) {
        // Lưu tokens nếu server trả về
        if (response.data.data.accessToken && response.data.data.refreshToken) {
          await TokenService.setTokens(
            response.data.data.accessToken,
            response.data.data.refreshToken
          );
        }
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  }

  /**
   * Đăng xuất
   * @returns {Promise} - Kết quả đăng xuất
   */
  async logout() {
    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (refreshToken) {
        // Gọi API đăng xuất nếu cần
        await this.api.post('/logout', { refreshToken });
      }
      // Xóa tokens
      await TokenService.removeTokens();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa tokens ngay cả khi API thất bại
      await TokenService.removeTokens();
      throw error;
    }
  }

  /**
   * Làm mới token
   * @returns {Promise} - Kết quả làm mới token
   */
  async refreshToken() {
    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Sending refresh token request to:', `${API_URL_AUTH}/refresh-token`);
      const response = await this.api.post('/refresh-token', { refreshToken });
      
      if (response.data.success && response.data.data.accessToken) {
        console.log('Successfully refreshed token');
        await TokenService.setTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken || refreshToken // Use old refresh token if new one not provided
        );
        return response.data;
      }
      
      console.error('Invalid refresh token response:', response.data);
      throw new Error('Failed to refresh token - invalid response format');
    } catch (error) {
      console.error('Refresh token error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Remove tokens if refresh fails
      await TokenService.removeTokens();
      throw error;
    }
  }

  /**
   * Validate current token
   * @returns {Promise<boolean>} - Whether token is valid
   */
  async validateToken() {
    try {
      const token = await TokenService.getAccessToken();
      if (!token) {
        console.log('No token available for validation');
        return false;
      }

      console.log('Validating token at:', `${API_URL_AUTH}/validate-token`);
      const response = await this.api.post('/validate-token', null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.success === true;
    } catch (error) {
      console.error('Token validation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  }

  /**
   * Gửi OTP
   * @param {string} phoneNumber - Số điện thoại cần gửi OTP
   * @returns {Promise} - Kết quả gửi OTP
   */
  async sendOTP(phoneNumber) {
    try {
      const response = await this.api.post('/send-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  }

  /**
   * Xác thực OTP
   * @param {string} phoneNumber - Số điện thoại đã gửi OTP
   * @param {string} otp - Mã OTP cần xác thực
   * @returns {Promise} - Kết quả xác thực OTP
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      const response = await this.api.post('/verify-otp', { phoneNumber, otp });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  }

  /**
   * Quên mật khẩu
   * @param {string} phoneNumber - Số điện thoại cần đặt lại mật khẩu
   * @returns {Promise} - Kết quả đặt lại mật khẩu
   */
  async forgotPassword(phoneNumber) {
    try {
      const response = await this.api.post('/forgot-password', { phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Số điện thoại không tồn tại trong hệ thống');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy tài khoản với số điện thoại này');
      } else if (error.response?.status === 429) {
        throw new Error('Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau');
      } else {
        throw new Error('Không thể lấy lại mật khẩu. Vui lòng thử lại sau');
      }
    }
  }

  /**
   * Reset mật khẩu
   * @param {Object} resetData - Thông tin đặt lại mật khẩu
   * @returns {Promise} - Kết quả đặt lại mật khẩu
   */
  async resetPassword(resetData) {
    try {
      const response = await this.api.post('/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  }
}

export default new AuthService(); 