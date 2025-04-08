import axios from 'axios';

/**
 * Cấu hình API Gateway
 * - 10.0.2.2 là localhost cho Android emulator
 * - localhost cho iOS simulator
 * - IP thật cho thiết bị thật
 */
const API_URL = 'http://10.0.2.2:8000/api';  // 10.0.2.2 là localhost cho Android emulator
// const API_URL = 'http://localhost:8000/api';  // Cho iOS simulator
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
   * @param {string} token - Token xác thực
   * @returns {Promise} - Thông tin profile người dùng
   */
  async getProfile(token) {
    try {
      const response = await axiosInstance.get('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data; // Trả về thông tin profile người dùng
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} updatedData - Thông tin cần cập nhật
   * @param {string} token - Token xác thực
   * @returns {Promise} - Dữ liệu người dùng sau khi cập nhật
   */
  async updateProfile(updatedData, token) {
    try {
      const response = await axiosInstance.put('/users/profile', updatedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data; // Trả về dữ liệu người dùng sau khi cập nhật
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Thay đổi mật khẩu người dùng
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   * @param {string} token - Token xác thực
   * @returns {Promise} - Thông báo thành công
   */
  async changePassword(currentPassword, newPassword, token) {
    try {
      const response = await axiosInstance.put('/users/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
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
   * @param {string} token - Token xác thực
   * @returns {Promise} - URL của avatar đã tải lên
   */
  async uploadAvatar(file, token) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axiosInstance.put('/users/avatar', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
   * @param {string} token - Token xác thực
   * @returns {Promise} - Danh sách người dùng
   */
  async searchUsers(token) {
    try {
      const response = await axiosInstance.get('/users/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data; // Trả về danh sách người dùng
    } catch (error) {
      console.error('Error searching users:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Lấy thông tin người dùng theo số điện thoại
   * @param {string} phone - Số điện thoại cần tìm
   * @param {string} token - Token xác thực
   * @returns {Promise} - Thông tin người dùng
   */
  async getUserByPhone(phone, token) {
    try {
      const response = await axiosInstance.get(`/users/phone/${phone}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data; // Trả về thông tin người dùng
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      throw error.response ? error.response.data : error;
    }
  }
}

export default UserService;
