import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth'; // URL của Java Spring backend

const authService = {
  // Gửi OTP đăng ký
  sendRegistrationOTP: async (phoneNumber) => {
    try {
      console.log('Sending OTP request to:', `${API_URL}/register/send-otp`);
      console.log('Phone number:', phoneNumber);
      const response = await axios.post(`${API_URL}/register/send-otp`, {
        phoneNumber: phoneNumber
      });
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error.response?.data || { message: 'Có lỗi xảy ra khi gửi OTP đăng ký' };
    }
  },

  // Xác thực OTP đăng ký
  verifyRegistrationOTP: async (phoneNumber, otp) => {
    try {
      const response = await axios.post(`${API_URL}/register/verify-otp`, {
        phoneNumber: phoneNumber,
        otp: otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi xác thực OTP đăng ký' };
    }
  },

  // Hoàn tất đăng ký
  completeRegistration: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register/complete`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi hoàn tất đăng ký' };
    }
  },

  // Đăng nhập bằng số điện thoại và mật khẩu
  login: async (phoneNumber, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        phoneNumber: phoneNumber,
        password: password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  },

  // Đăng nhập bằng số điện thoại và OTP
  loginWithPhone: async (phoneNumber, otp) => {
    try {
      const response = await axios.post(`${API_URL}/login/phone`, {
        phoneNumber: phoneNumber,
        otp: otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng nhập bằng OTP' };
    }
  },

  // Gửi OTP đặt lại mật khẩu
  sendPasswordResetOTP: async (phoneNumber) => {
    try {
      const response = await axios.post(`${API_URL}/send-otp`, {
        phoneNumber: phoneNumber
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi gửi OTP đặt lại mật khẩu' };
    }
  },

  // Đăng xuất
  logout: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/logout`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi đăng xuất' };
    }
  },

  // Làm mới token
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${API_URL}/refresh-token`, {
        refreshToken: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi làm mới token' };
    }
  },

  // Cập nhật trạng thái người dùng
  updateUserStatus: async (token, status) => {
    try {
      const response = await axios.put(`${API_URL}/users/status`, {
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