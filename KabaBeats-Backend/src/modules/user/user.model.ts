import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

export interface IUserProfile extends IUser, Document {
  _id: string;
  followers: string[];
  following: string[];
  totalBeats: number;
  totalPlays: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  isVerified: boolean;
  isProducer: boolean;
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      showEmail: boolean;
      showFollowers: boolean;
      showFollowing: boolean;
    };
  };
  stats: {
    monthlyPlays: number;
    monthlyLikes: number;
    monthlyFollowers: number;
    topGenres: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>({
  // Inherit from base user schema
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
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
    enum: ['user', 'producer', 'admin'],
    default: 'user',
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
    default: Date.now,
  },

  // Extended profile fields
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'UserProfile',
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'UserProfile',
  }],
  totalBeats: {
    type: Number,
    default: 0,
  },
  totalPlays: {
    type: Number,
    default: 0,
  },
  totalLikes: {
    type: Number,
    default: 0,
  },
  totalFollowers: {
    type: Number,
    default: 0,
  },
  totalFollowing: {
    type: Number,
    default: 0,
  },
  isProducer: {
    type: Boolean,
    default: false,
  },
  socialLinks: {
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website must be a valid URL',
      },
    },
    instagram: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^@?[a-zA-Z0-9._]+$/.test(v);
        },
        message: 'Instagram handle must be valid',
      },
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^@?[a-zA-Z0-9_]+$/.test(v);
        },
        message: 'Twitter handle must be valid',
      },
    },
    youtube: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^@?[a-zA-Z0-9._-]+$/.test(v);
        },
        message: 'YouTube handle must be valid',
      },
    },
    soundcloud: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[a-zA-Z0-9._-]+$/.test(v);
        },
        message: 'SoundCloud username must be valid',
      },
    },
    spotify: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[a-zA-Z0-9._-]+$/.test(v);
        },
        message: 'Spotify username must be valid',
      },
    },
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    privacy: {
      showEmail: {
        type: Boolean,
        default: false,
      },
      showFollowers: {
        type: Boolean,
        default: true,
      },
      showFollowing: {
        type: Boolean,
        default: true,
      },
    },
  },
  stats: {
    monthlyPlays: {
      type: Number,
      default: 0,
    },
    monthlyLikes: {
      type: Number,
      default: 0,
    },
    monthlyFollowers: {
      type: Number,
      default: 0,
    },
    topGenres: [{
      type: String,
    }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for full name
userProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Virtual for display name
userProfileSchema.virtual('displayName').get(function() {
  return (this as any).fullName || this.username;
});

// Indexes for better performance (username and email already have unique indexes)
userProfileSchema.index({ followers: 1 });
userProfileSchema.index({ following: 1 });
userProfileSchema.index({ isVerified: 1 });
userProfileSchema.index({ isProducer: 1 });
userProfileSchema.index({ totalFollowers: -1 });
userProfileSchema.index({ totalPlays: -1 });

// Methods
userProfileSchema.methods.follow = async function(userId: string) {
  if (this._id.toString() === userId) {
    throw new Error('Cannot follow yourself');
  }
  
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    this.totalFollowing = this.following.length;
    await this.save();
  }
};

userProfileSchema.methods.unfollow = async function(userId: string) {
  this.following = this.following.filter((id: any) => id.toString() !== userId);
  this.totalFollowing = this.following.length;
  await this.save();
};

userProfileSchema.methods.addFollower = async function(userId: string) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
    this.totalFollowers = this.followers.length;
    await this.save();
  }
};

userProfileSchema.methods.removeFollower = async function(userId: string) {
  this.followers = this.followers.filter((id: any) => id.toString() !== userId);
  this.totalFollowers = this.followers.length;
  await this.save();
};

userProfileSchema.methods.updateStats = async function(stats: Partial<IUserProfile['stats']>) {
  this.stats = { ...this.stats, ...stats };
  await this.save();
};

userProfileSchema.methods.incrementPlays = async function(count: number = 1) {
  this.totalPlays += count;
  this.stats.monthlyPlays += count;
  await this.save();
};

userProfileSchema.methods.incrementLikes = async function(count: number = 1) {
  this.totalLikes += count;
  this.stats.monthlyLikes += count;
  await this.save();
};

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
