import express from 'express';
import { login, getMe, logout } from '../controllers/authController.js';
import auth from '../middleware/auth.middleware.js';
import { loginSchema } from '../validations/auth.validation.js';
import validate from '../middleware/validate.middleware.js';

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", auth, getMe);
router.post("/logout", auth, logout);

export default router;
