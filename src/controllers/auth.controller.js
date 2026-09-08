import User from "../models/User.model.js";
import OTP from "../models/OTP.model.js";
import bcrypt from "bcryptjs";
import {
  registerSchema,
  otpSchema,
  forgotPasswordSchema,
   resetPasswordSchema,
} from "../validation/auth.validation.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

import { forgotPasswordOtpTemplate } from "../templates/emailTemplates.js";

// POST /auth/register/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { username, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      userData: { username, email, password, phone },
    });
    await sendEmail(email, "E-Commerce Verification Code", `Your verification code is: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// POST /auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { error } = otpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }
    const user = await User.create({...otpRecord.userData, isVerified: true });
    await OTP.deleteOne({ _id: otpRecord._id });
    return res.status(201).json({
      message: "User registered and verified successfully",
      user: { id: user._id, username: user.username, email: user.email, phone: user.phone, isVerified: user.isVerified },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
};


// POST /auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get user",
    });
  }
};


// POST /auth/logout

export const logout = async (req, res) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
};



// POST /auth/forgotpassword/send-otp

export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
// Generate OTP

const otp = Math.floor(100000 + Math.random() * 900000).toString();


let textResetPassword = "Reset Your Password"
    

    // Delete old OTP for this email
    await OTP.deleteMany({ email });

    // Save otp data with OTP
    await OTP.create({
      email,
      otp,
      userData:user,
    });



// Send OTP
await sendEmail(
    email,
    textResetPassword,
    forgotPasswordOtpTemplate(otp),
);

return res.status(200).json({ message: "OTP sent successfully" });

 } catch (error) {
    console.error(error);
    return res.status(500).json({
        message: "Failed to send OTP",
        error: error.message,
    });
  }
}

// POST /auth/forgotpassword/verify-otp
export const verifyForgotPasswordOtp = async (req, res) => {
 try {
   const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, otp , newPassword } = req.body;

    // Find OTP
    const findotp = await OTP.findOne({ email, otp });

    if (!findotp) {
        return res.status(404).json({status : "fail" , data : "Invalid OTP"})
    }
    // Check expiration
    if (findotp.expiresAt < Date.now()) 
        {
        return res.status(404).json({status : "fail" , data : "OTP Expired"})
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({status : "fail" , data : "User not found"})
    }   

    // Update password
    user.password = newPassword;
    await user.save();      

    // Delete used OTP
    await OTP.deleteOne({ _id: findotp._id });

    return res.status(200).json({
        message: "OTP verified successfully",
    });


  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to verify OTP",
      error: error.message,
    });

  }
}




