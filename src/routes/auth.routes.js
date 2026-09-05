import express from "express";
import {
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;