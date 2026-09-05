import Joi from "joi";

const objectId = Joi.string().hex().length(24).messages({
    'string.hex': 'Invalid ID format',
    'string.length': 'Invalid ID format',
});

//Create Address

const addressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().min(8).max(20).required(),
  country: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  postalCode: Joi.string().trim().required(),
});

//Create New User

const createUserSchema = Joi.object({
    username: Joi.string().trim().min(2).max(50).required().messages({ 'any.required': 'Username is required' }),

    email: Joi.string().email().lowercase().required().messages({ 'string.email': 'Please enter a valid email' }),

    password: Joi.string().min(8).max(128).required().messages({ 'string.min': 'Password must be at least 8 characters' }),

    phone: Joi.string().trim().min(8).max(20).optional().allow('', null),

    role: Joi.string().valid('admin', 'customer').default('customer'),

    avatar: Joi.string().uri().optional().allow('', null),

    addresses: Joi.array().items(addressSchema).optional(),
});

//End

//Update User Information

const updateUserSchema = Joi.object({
    username: Joi.string().trim().min(2).max(50).optional(),

    phone: Joi.string().trim().min(8).max(20).optional().allow('', null),

    avatar: Joi.string().uri().optional().allow('', null),

    addresses: Joi.array().items(addressSchema).optional()
}).min(1);

//End

//Change The Password

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({ 'any.required': 'Current password is required' }),

    newPassword: Joi.string().min(8).max(128).required().messages({
      'string.min': 'New password must be at least 8 characters',
      'any.required': 'New password is required',
    }),

    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Confirm password must match new password',
      'any.required': 'Confirm password is required',
    }),
});

//End

const userIdSchema = Joi.object({
    id: objectId.required(),
});

export default   {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userIdSchema,
};