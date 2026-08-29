const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .required(),

  phone: Joi.string()
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required(),
});

const otpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
};


