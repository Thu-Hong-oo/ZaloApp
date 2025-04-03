const UserModel = require('../models/userModel');
const logger = require('../utils/loggerUtil');

class UserService {
  /**
   * Lấy thông tin người dùng theo ID
   */
  static async getUserById(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }
      return user;
    } catch (error) {
      logger.error(`Lỗi getUserById: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Lấy thông tin người dùng theo số điện thoại
   */
  static async getUserByPhoneNumber(phoneNumber) {
    try {
      return await UserModel.findByPhoneNumber(phoneNumber);
    } catch (error) {
      logger.error(`Lỗi getUserByPhoneNumber: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Tạo hoặc cập nhật người dùng từ xác thực
   */
  static async createOrUpdateFromAuth(phoneNumber) {
    try {
      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUser = await UserModel.findByPhoneNumber(phoneNumber);
      
      if (existingUser) {
        // Nếu người dùng đã tồn tại, chỉ cập nhật trạng thái đăng nhập
        return await UserModel.update(existingUser.userId, {
          status: 'online',
          lastLogin: new Date().toISOString()
        });
      } else {
        // Nếu chưa tồn tại, tạo người dùng mới
        return await UserModel.create({ phoneNumber });
      }
    } catch (error) {
      logger.error(`Lỗi createOrUpdateFromAuth: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cập nhật hồ sơ người dùng
   */
  static async updateProfile(userId, profileData) {
    try {
      // Kiểm tra người dùng tồn tại
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }
      
      // Cập nhật thông tin
      return await UserModel.update(userId, profileData);
    } catch (error) {
      logger.error(`Lỗi updateProfile: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cập nhật URL ảnh đại diện
   */
  static async updateProfilePicture(userId, pictureUrl) {
    try {
      return await UserModel.update(userId, { profilePictureUrl: pictureUrl });
    } catch (error) {
      logger.error(`Lỗi updateProfilePicture: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cập nhật trạng thái người dùng
   */
  static async updateStatus(userId, status) {
    try {
      return await UserModel.update(userId, { status });
    } catch (error) {
      logger.error(`Lỗi updateStatus: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserService;