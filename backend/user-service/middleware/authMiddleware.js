const jwt = require('jsonwebtoken');
const response = require('../utils/responseUtil');
const logger = require('../utils/loggerUtil');

const JWT_SECRET = process.env.JWT_SECRET || 'zalo_account_service_secret';

/**
 * Middleware xác thực JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(response.error('Không tìm thấy token'));
    }
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.error(`Lỗi xác thực token: ${err.message}`);
        return res.status(401).json(response.error('Token không hợp lệ hoặc đã hết hạn'));
      }
      
      // Lưu thông tin người dùng vào request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error(`Lỗi xác thực: ${error.message}`);
    return res.status(500).json(response.error('Lỗi máy chủ'));
  }
};

module.exports = authMiddleware;