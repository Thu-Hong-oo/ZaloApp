const Joi = require('joi');
const response = require('../utils/responseUtil');

/**
 * Middleware kiểm tra dữ liệu đầu vào
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json(
        response.error('Dữ liệu không hợp lệ', error.details[0].message)
      );
    }
    
    next();
  };
};

// Các schema validation
const schemas = {
  createProfile: Joi.object({
    displayName: Joi.string().min(2).max(50).required(),
    bio: Joi.string().max(200).allow('', null),
    dateOfBirth: Joi.date().iso().allow(null),
    gender: Joi.string().valid('male', 'female', 'other').allow(null)
  }),
  
  updateProfile: Joi.object({
    displayName: Joi.string().min(2).max(50),
    bio: Joi.string().max(200).allow('', null),
    dateOfBirth: Joi.date().iso().allow(null),
    gender: Joi.string().valid('male', 'female', 'other').allow(null),
    status: Joi.string().valid('online', 'offline', 'busy', 'away').allow(null)
  })
};

module.exports = {
  validateSchema,
  schemas
};