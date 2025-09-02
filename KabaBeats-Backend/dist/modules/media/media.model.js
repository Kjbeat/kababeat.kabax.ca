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
exports.MediaFile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const mediaFileSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    processedKey: {
        type: String,
        required: false,
    },
    thumbnailKey: {
        type: String,
        required: false,
    },
    userId: {
        type: String,
        required: true,
        ref: 'User',
    },
    beatId: {
        type: String,
        required: false,
        ref: 'Beat',
    },
    fileType: {
        type: String,
        required: true,
        enum: ['audio', 'image', 'profile', 'artwork'],
    },
    title: {
        type: String,
        maxlength: 100,
    },
    description: {
        type: String,
        maxlength: 500,
    },
    tags: [{
            type: String,
            maxlength: 30,
        }],
    isPublic: {
        type: Boolean,
        default: false,
    },
    metadata: {
        duration: Number,
        bitrate: Number,
        sampleRate: Number,
        width: Number,
        height: Number,
        format: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
    },
    status: {
        type: String,
        required: true,
        enum: ['uploading', 'processing', 'processed', 'failed'],
        default: 'uploading',
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    processedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
mediaFileSchema.index({ userId: 1, fileType: 1 });
mediaFileSchema.index({ beatId: 1 });
mediaFileSchema.index({ status: 1 });
mediaFileSchema.index({ uploadedAt: -1 });
mediaFileSchema.index({ isPublic: 1, fileType: 1 });
mediaFileSchema.virtual('publicUrl').get(function () {
    if (this.isPublic) {
        return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${this.key}`;
    }
    return null;
});
mediaFileSchema.virtual('downloadUrl').get(function () {
    return null;
});
mediaFileSchema.set('toJSON', { virtuals: true });
mediaFileSchema.set('toObject', { virtuals: true });
exports.MediaFile = mongoose_1.default.model('MediaFile', mediaFileSchema);
//# sourceMappingURL=media.model.js.map