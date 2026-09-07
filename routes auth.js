const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('./controllers/authController');
const { protect } = require('./middleware/protect');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


router.post('/auth/login', validate(loginSchema), login);
router.get('/auth/me', protect, getMe);
router.post('/auth/logout', protect, logout);

module.exports = router;
