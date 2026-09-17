import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 10 * 60 * 1000 
  },
  userData: {
    type: Object,
    required: true
  }
}, { 
  timestamps: true 
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OTP', otpSchema);
