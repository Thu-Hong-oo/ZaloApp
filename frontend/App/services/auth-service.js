import axios from 'axios';

const API_URL = 'http://192.168.1.163:8080/api/auth';

const authService = {
  // Gửi OTP đăng ký
  sendRegistrationOTP: async (phoneNumber) => {
    try {
      console.log('Sending registration OTP request:', {
        url: `${API_URL}/register/send-otp`,
        data: { phoneNumber }
      });
      const response = await axios.post(`${API_URL}/register/send-otp`, {
        phoneNumber: phoneNumber
      });
      console.log('Registration OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in sendRegistrationOTP:', error.response || error);
      throw error.response?.data || { message: 'Có lỗi xảy ra khi gửi OTP đăng ký' };
    }
  },

 // Xác thực OTP đăng ký
verifyRegistrationOTP: async (phoneNumber, otp) => {
  try {
    console.log('Verifying registration OTP request:', {
      url: `${API_URL}/register/verify-otp`,
      data: { phoneNumber, otp }
    });
    const response = await axios.post(`${API_URL}/register/verify-otp`, {
      phoneNumber: phoneNumber,
      otp: otp
    });

    // Giả sử backend trả về cấu trúc ApiResponse
    console.log('Verify OTP response:', response.data);

    // Chuyển đổi thành ApiResponse nếu chưa trả về đúng định dạng
    return {
      success: response.data.success,
      message: response.data.message || 'Có lỗi xảy ra khi xác thực OTP',
      data: response.data.data
    };
  } catch (error) {
    console.error('Error in verifyRegistrationOTP:', error.response || error);
    throw error.response?.data || { message: 'Có lỗi xảy ra khi xác thực OTP' };
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

  // Đăng nhập
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