const authService = require('../services/authService');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }

    try {
      // Validate token with auth-service
      const tokenData = await authService.validateToken(token);
      
      // Get user info from auth-service
      const userInfo = await authService.getUserInfo(token);
      
      // Add user info to request
      req.user = {
        userId: userInfo.phoneNumber,
        phoneNumber: userInfo.phoneNumber,
        ...userInfo
      };
      
      next();
    } catch (error) {
      // If token is invalid or expired, try to refresh it
      const refreshToken = req.headers['x-refresh-token'];
      if (refreshToken) {
        try {
          const newTokens = await authService.refreshToken(refreshToken);
          
          // Add new tokens to response headers
          res.setHeader('x-new-access-token', newTokens.accessToken);
          res.setHeader('x-new-refresh-token', newTokens.refreshToken);
          
          // Continue with the new access token
          const userInfo = await authService.getUserInfo(newTokens.accessToken);
          req.user = {
            userId: userInfo.phoneNumber,
            phoneNumber: userInfo.phoneNumber,
            ...userInfo
          };
          
          next();
        } catch (refreshError) {
          return res.status(401).json({
            success: false,
            message: 'Token expired and refresh failed'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = authMiddleware; 