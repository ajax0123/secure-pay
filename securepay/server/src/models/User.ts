import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  kycHashedId: { type: String, select: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  privacySettings: {
    analyticsTracking: { type: Boolean, default: true },
    transactionVisibility: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.index({ email: 1 });

export const User = mongoose.model('User', userSchema);
