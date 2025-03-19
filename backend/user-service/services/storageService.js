const AWS = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/loggerUtil');

const s3 = AWS.s3;
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'zalo-account-service-storage';

class StorageService {
  /**
   * Tải file lên S3
   */
  static async uploadFile(fileBuffer, fileType, prefix = 'uploads') {
    try {
      // Tạo key cho file
      const fileExtension = fileType.split('/')[1] || 'unknown';
      const fileName = `${prefix}/${uuidv4()}.${fileExtension}`;
      
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: fileType
      };
      
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      logger.error(`Lỗi khi tải file lên S3: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Tải ảnh đại diện lên S3
   */
  static async uploadProfilePicture(userId, imageBuffer, fileType) {
    try {
      return await this.uploadFile(
        imageBuffer,
        fileType,
        `profiles/${userId}`
      );
    } catch (error) {
      logger.error(`Lỗi khi tải ảnh đại diện: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Xóa file trên S3
   */
  static async deleteFile(fileUrl) {
    try {
      // Lấy key từ URL
      const key = fileUrl.split(`${BUCKET_NAME}/`)[1];
      
      const params = {
        Bucket: BUCKET_NAME,
        Key: key
      };
      
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      logger.error(`Lỗi khi xóa file: ${error.message}`);
      throw error;
    }
  }
}

module.exports = StorageService;