const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    first_name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'any.required': 'First name is required'
    }),
    last_name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'any.required': 'Last name is required'
    }),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    address: Joi.string().max(500).optional().allow('')
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data);
};

const equipmentValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Equipment name must be at least 2 characters long',
      'any.required': 'Equipment name is required'
    }),
    description: Joi.string().max(1000).optional().allow(''),
    category: Joi.string().valid('Construction', 'Heavy Equipment', 'Power Tools', 'Lawn & Garden', 'Party & Events', 'Other').required().messages({
      'any.required': 'Category is required',
      'string.empty': 'Category is required',
      'any.only': 'Category must be one of: Construction, Heavy Equipment, Power Tools, Lawn & Garden, Party & Events, Other'
    }),
    hourly_rate: Joi.number().precision(2).min(0).optional(),
    daily_rate: Joi.number().precision(2).min(0).required().messages({
      'any.required': 'Daily rate is required'
    }),
    weekly_rate: Joi.number().precision(2).min(0).optional(),
    monthly_rate: Joi.number().precision(2).min(0).optional(),
    quantity: Joi.number().integer().min(1).required().messages({
      'any.required': 'Quantity is required',
      'number.min': 'Quantity must be at least 1'
    }),
    available_quantity: Joi.number().integer().min(0).optional(),
    condition: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
    location: Joi.string().max(255).optional(),
    specifications: Joi.string().optional().allow('')
  });

  return schema.validate(data);
};

const rentalValidation = (data) => {
  const schema = Joi.object({
    equipment_id: Joi.number().integer().positive().required().messages({
      'any.required': 'Equipment is required'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
      'any.required': 'Quantity is required',
      'number.min': 'Quantity must be at least 1'
    }),
    start_date: Joi.date().greater('now').required().messages({
      'date.greater': 'Start date must be in the future',
      'any.required': 'Start date is required'
    }),
    end_date: Joi.date().greater(Joi.ref('start_date')).required().messages({
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
    notes: Joi.string().max(500).optional().allow('')
  });

  return schema.validate(data);
};

const validate = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(detail => detail.message) 
      });
    }
    next();
  };
};

module.exports = {
  registerValidation,
  loginValidation,
  equipmentValidation,
  rentalValidation,
  validate
};