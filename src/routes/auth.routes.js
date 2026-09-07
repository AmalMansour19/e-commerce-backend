import express from "express";
import {
    forgotPassword,
  sendOtp,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/forgotpassword/send-otp", forgotPassword);
router.post("/forgotpassword/verify-otp", verifyForgotPasswordOtp);

export default router;