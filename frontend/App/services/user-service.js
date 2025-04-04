import axios from 'axios';

// Định nghĩa URL API backend
const API_URL = 'http://localhost:8080/api/user'; 

const UserService = {
  // Đăng ký người dùng mới
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data; // Trả về dữ liệu thành công từ API
    } catch (error) {
      console.error('Error registering user:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Lấy thông tin profile người dùng
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Dùng token lưu trong localStorage hoặc cookie
        }
      });
      return response.data; // Trả về thông tin profile người dùng
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Cập nhật thông tin người dùng
  async updateProfile(updatedData) {
    try {
      const response = await axios.put(`${API_URL}/profile`, updatedData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data; // Trả về dữ liệu người dùng sau khi cập nhật
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Thay đổi mật khẩu người dùng
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put(`${API_URL}/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data; // Trả về thông báo thành công
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Tải ảnh đại diện lên
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.put(`${API_URL}/avatar`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',  // Quan trọng khi gửi file
        }
      });
      return response.data; // Trả về URL của avatar đã tải lên
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Tìm kiếm người dùng
  async searchUsers() {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data; // Trả về danh sách người dùng
    } catch (error) {
      console.error('Error searching users:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // Lấy thông tin người dùng theo số điện thoại
  async getUserByPhone(phone) {
    try {
      const response = await axios.get(`${API_URL}/user/${phone}`);
      return response.data; // Trả về thông tin người dùng
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      throw error.response ? error.response.data : error;
    }
  }
}

export default  UserService;
