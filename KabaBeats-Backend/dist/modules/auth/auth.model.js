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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
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
        required: function () {
            return !this.googleId && !this.facebookId;
        },
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false,
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
    emailVerificationOTP: {
        type: String,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },
    socialLinks: {
        website: {
            type: String,
            match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
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
    },
    themePreferences: {
        mode: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system',
        },
        customTheme: {
            primary: {
                type: String,
                default: '#000000',
            },
            accent: {
                type: String,
                default: '#262626',
            },
            radius: {
                type: Number,
                default: 0.75,
                min: 0.125,
                max: 2,
            },
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.virtual('fullName').get(function () {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
});
userSchema.virtual('displayName').get(function () {
    if (this.firstName) {
        return this.firstName;
    }
    return this.username;
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password)
        return next();
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        this.password = await bcrypt.hash(this.password, 12);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.generateAuthToken = function () {
    const jwt = require('jsonwebtoken');
    const payload = {
        userId: this._id,
        email: this.email,
        role: this.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};
userSchema.methods.generateRefreshToken = function () {
    const jwt = require('jsonwebtoken');
    const payload = {
        userId: this._id,
        email: this.email,
        role: this.role,
    };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
};
userSchema.methods.addRefreshToken = function (token) {
    if (!this.refreshTokens) {
        this.refreshTokens = [];
    }
    this.refreshTokens.push(token);
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens.slice(-5);
    }
    return this.save();
};
userSchema.methods.removeRefreshToken = function (token) {
    if (!this.refreshTokens) {
        this.refreshTokens = [];
    }
    this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
    return this.save();
};
userSchema.methods.clearRefreshTokens = function () {
    this.refreshTokens = [];
    return this.save();
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=auth.model.js.map