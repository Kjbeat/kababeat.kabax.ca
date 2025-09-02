"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userProfileSchema = new mongoose_1.Schema({
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
    followers: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'UserProfile',
        }],
    following: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
                validator: function (v) {
                    return !v || /^https?:\/\/.+/.test(v);
                },
                message: 'Website must be a valid URL',
            },
        },
        instagram: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+$/.test(v);
                },
                message: 'Instagram URL must be valid',
            },
        },
        twitter: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/.test(v);
                },
                message: 'Twitter URL must be valid',
            },
        },
        youtube: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9._-]+$/.test(v);
                },
                message: 'YouTube URL must be valid',
            },
        },
        soundcloud: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^[a-zA-Z0-9._-]+$/.test(v);
                },
                message: 'SoundCloud username must be valid',
            },
        },
        spotify: {
            type: String,
            validate: {
                validator: function (v) {
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
userProfileSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
userProfileSchema.virtual('displayName').get(function () {
    return this.fullName || this.username;
});
userProfileSchema.index({ followers: 1 });
userProfileSchema.index({ following: 1 });
userProfileSchema.index({ isVerified: 1 });
userProfileSchema.index({ isProducer: 1 });
userProfileSchema.index({ totalFollowers: -1 });
userProfileSchema.index({ totalPlays: -1 });
userProfileSchema.methods.follow = async function (userId) {
    if (this._id.toString() === userId) {
        throw new Error('Cannot follow yourself');
    }
    if (!this.following.includes(userId)) {
        this.following.push(userId);
        this.totalFollowing = this.following.length;
        await this.save();
    }
};
userProfileSchema.methods.unfollow = async function (userId) {
    this.following = this.following.filter((id) => id.toString() !== userId);
    this.totalFollowing = this.following.length;
    await this.save();
};
userProfileSchema.methods.addFollower = async function (userId) {
    if (!this.followers.includes(userId)) {
        this.followers.push(userId);
        this.totalFollowers = this.followers.length;
        await this.save();
    }
};
userProfileSchema.methods.removeFollower = async function (userId) {
    this.followers = this.followers.filter((id) => id.toString() !== userId);
    this.totalFollowers = this.followers.length;
    await this.save();
};
userProfileSchema.methods.updateStats = async function (stats) {
    this.stats = { ...this.stats, ...stats };
    await this.save();
};
userProfileSchema.methods.incrementPlays = async function (count = 1) {
    this.totalPlays += count;
    this.stats.monthlyPlays += count;
    await this.save();
};
userProfileSchema.methods.incrementLikes = async function (count = 1) {
    this.totalLikes += count;
    this.stats.monthlyLikes += count;
    await this.save();
};
exports.UserProfile = mongoose_1.default.model('UserProfile', userProfileSchema);
//# sourceMappingURL=user.model.js.map