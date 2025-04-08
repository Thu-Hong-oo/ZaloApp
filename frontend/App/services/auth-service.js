import axios from 'axios';

/**
 * Cấu hình API Gateway
 * - Sử dụng localhost cho Expo Web
 * - Sử dụng 10.0.2.2 cho Android emulator
 * - Sử dụng localhost cho iOS simulator
 * - Sử dụng IP thật cho thiết bị thật
 */
const API_URL = 'http://localhost:8000/api';

/**
 * Cấu hình axios với timeout và headers mặc định
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
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
const authService = {
  /**
   * Gửi OTP đăng ký
   * @param {string} phoneNumber - Số điện thoại cần gửi OTP
   * @returns {Promise} - Kết quả gửi OTP
   */
  sendRegistrationOTP: async (phoneNumber) => {
    try {
      console.log('Sending registration OTP request:', {
        url: `${API_URL}/auth/register/send-otp`,
        data: { phoneNumber }
      });
      const response = await axiosInstance.post('/auth/register/send-otp', {
        phoneNumber: phoneNumber
      });
      console.log('Registration OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in sendRegistrationOTP:', error);
      if (error.code === 'ECONNABORTED') {
        throw { message: 'Không thể kết nối đến server. Vui lòng thử lại sau.' };
      }
      if (error.code === 'ERR_NETWORK') {
        throw { message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.' };
      }
      throw error.response?.data || { message: 'Có lỗi xảy ra khi gửi OTP đăng ký' };
    }
  },

  /**
   * Xác thực OTP đăng ký
   * @param {string} phoneNumber - Số điện thoại đã gửi OTP
   * @param {string} otp - Mã OTP cần xác thực
   * @returns {Promise} - Kết quả xác thực OTP
   */
  verifyRegistrationOTP: async (phoneNumber, otp) => {
    try {
      console.log('Verifying registration OTP request:', {
        url: `${API_URL}/auth/register/verify-otp`,
        data: { phoneNumber, otp }
      });
      const response = await axiosInstance.post('/auth/register/verify-otp', {
        phoneNumber: phoneNumber,
        otp: otp
      });

      console.log('Verify OTP response:', response.data);
      return {
        success: response.data.success,
        message: response.data.message || 'Có lỗi xảy ra khi xác thực OTP',
        data: response.data.data
      };
    } catch (error) {
      console.error('Error in verifyRegistrationOTP:', error);
      throw error.response?.data || { message: 'Có lỗi xảy ra khi xác thực OTP' };
    }
  },

  /**
   * Hoàn tất đăng ký
   * @param {Object} userData - Thông tin người dùng cần đăng ký
   * @returns {Promise} - Kết quả đăng ký
   */
  completeRegistration: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register/complete', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi hoàn tất đăng ký' };
    }
  },

  /**
   * Đăng nhập
   * @param {string} phoneNumber - Số điện thoại đăng nhập
   * @param {string} password - Mật khẩu đăng nhập
   * @returns {Promise} - Kết quả đăng nhập
   */
  login: async (phoneNumber, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        phoneNumber: phoneNumber,
        password: password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  },

  /**
   * Đăng nhập bằng số điện thoại và OTP
   * @param {string} phoneNumber - Số điện thoại đăng nhập
   * @param {string} otp - Mã OTP xác thực
   * @returns {Promise} - Kết quả đăng nhập
   */
  loginWithPhone: async (phoneNumber, otp) => {
    try {
      const response = await axiosInstance.post('/auth/login/phone', {
        phoneNumber: phoneNumber,
        otp: otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng nhập bằng OTP' };
    }
  },

  /**
   * Gửi OTP đặt lại mật khẩu
   * @param {string} phoneNumber - Số điện thoại cần đặt lại mật khẩu
   * @returns {Promise} - Kết quả gửi OTP
   */
  sendPasswordResetOTP: async (phoneNumber) => {
    try {
      const response = await axiosInstance.post('/auth/send-otp', {
        phoneNumber: phoneNumber
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi gửi OTP đặt lại mật khẩu' };
    }
  },

  /**
   * Đăng xuất
   * @param {string} token - Token xác thực
   * @returns {Promise} - Kết quả đăng xuất
   */
  logout: async (token) => {
    try {
      const response = await axiosInstance.post('/auth/logout', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng xuất' };
    }
  },

  /**
   * Làm mới token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} - Kết quả làm mới token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await axiosInstance.post('/auth/refresh-token', {
        refreshToken: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi làm mới token' };
    }
  },

  /**
   * Cập nhật trạng thái người dùng
   * @param {string} token - Token xác thực
   * @param {string} status - Trạng thái mới
   * @returns {Promise} - Kết quả cập nhật trạng thái
   */
  updateUserStatus: async (token, status) => {
    try {
      const response = await axiosInstance.put('/auth/users/status', {
        status: status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi cập nhật trạng thái' };
    }
  }
};

export default authService; 