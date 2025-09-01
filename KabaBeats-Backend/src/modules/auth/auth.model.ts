import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

export interface IUserDocument extends IUser, Document {
  _id: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if user is not using OAuth
      return !this.googleId && !this.facebookId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  },
  country: {
    type: String,
    default: 'Nigeria',
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'creator',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  refreshTokens: [{
    type: String,
    select: false,
  }],
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  socialLinks: {
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
    },
    instagram: {
      type: String,
      match: [/^@?[a-zA-Z0-9_.]+$/, 'Please enter a valid Instagram username'],
    },
    twitter: {
      type: String,
      match: [/^@?[a-zA-Z0-9_]+$/, 'Please enter a valid Twitter username'],
    },
    youtube: {
      type: String,
      match: [/^@?[a-zA-Z0-9_.-]+$/, 'Please enter a valid YouTube channel'],
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance (email and username already have unique indexes)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  if (this.firstName) {
    return this.firstName;
  }
  return this.username;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false; // OAuth users don't have passwords
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const jwt = require('jsonwebtoken');
  const payload = {
    userId: this._id,
    email: this.email,
    role: this.role,
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function(token: string) {
  // Ensure refreshTokens array exists
  if (!this.refreshTokens) {
    this.refreshTokens = [];
  }
  this.refreshTokens.push(token);
  // Keep only the last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  return this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function(token: string) {
  // Ensure refreshTokens array exists
  if (!this.refreshTokens) {
    this.refreshTokens = [];
  }
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
  return this.save();
};

// Method to clear all refresh tokens
userSchema.methods.clearRefreshTokens = function() {
  this.refreshTokens = [];
  return this.save();
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
