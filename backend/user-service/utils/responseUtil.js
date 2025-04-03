/**
 * Tạo định dạng phản hồi chuẩn
 */
const createResponse = (success, message, data = null, error = null) => {
    return {
      success,
      message,
      data,
      error,
      timestamp: new Date().toISOString()
    };
  };
  
  module.exports = {
    success: (message, data) => createResponse(true, message, data),
    error: (message, error) => createResponse(false, message, null, error)
  };