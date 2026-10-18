import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Username cannot be empty',
      'string.alphanum': 'Username can only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string().email().trim().required().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  bio: Joi.string().trim().max(250).allow(''),
  location: Joi.string().trim().max(100).allow(''),
  website: Joi.string().trim().max(100).allow('')
});

export const createPostSchema = Joi.object({
  content: Joi.string().trim().max(2000).allow('')
});

export const updatePostSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required()
});

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required(),
  parentComment: Joi.string().hex().length(24).optional().allow(null, '')
});
