//import bcryptjs from "bcryptjs";
import User from "../models/User.model.js";
import OTP from "../models/OTP.model.js";
import {
  registerSchema,
  otpSchema,
  forgotPasswordSchema,
} from "../validation/auth.validation.js";
import sendEmail from "../utils/sendEmail.js";
import { forgotPasswordOtpTemplate } from "../templates/emailTemplates.js";

// POST /auth/register/send-otp
export const sendOtp = async (req, res) => {
  try {
    // Validation
    const { error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { username, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTP for this email
    await OTP.deleteMany({ email });

    // Save registration data with OTP
    await OTP.create({
      email,
      otp,
      userData: {
        username,
        email,
        password,
        phone,
      },
    });

    // Send OTP
    await sendEmail(
      email,
      "E-Commerce Verification Code",
      `Your verification code is: ${otp}`
    );

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};


// POST /auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    // Validation
    const { error } = otpSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { email, otp } = req.body;

    // Find OTP
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // Create user after successful verification
    const user = await User.create({
      ...otpRecord.userData,
      isVerified: true,
    });

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      message: "User registered and verified successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
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
        message: "Failed to verify OTP",
        error: error.message,
    });
  }
}

// POST /auth/forgotpassword/verify-otp
export const verifyForgotPasswordOtp = async (req, res) => {
 try {
    const { error } = otpSchema.validate(req.body);
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




