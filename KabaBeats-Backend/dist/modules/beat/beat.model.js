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
exports.Beat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const beatSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    producer: {
        type: String,
        required: [true, 'Producer name is required'],
        trim: true,
        maxlength: [50, 'Producer name cannot exceed 50 characters'],
    },
    producerId: {
        type: String,
        required: [true, 'Producer ID is required'],
        ref: 'User',
    },
    artwork: {
        type: String,
        default: null,
    },
    audioFile: {
        type: String,
        required: [true, 'Audio file is required'],
    },
    bpm: {
        type: Number,
        required: [true, 'BPM is required'],
        min: [60, 'BPM must be at least 60'],
        max: [300, 'BPM cannot exceed 300'],
    },
    musicalKey: {
        type: String,
        required: [true, 'Musical key is required'],
        enum: [
            'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
            'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major',
            'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major',
            'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor',
            'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor'
        ],
    },
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        enum: [
            'Hip Hop', 'Trap', 'R&B', 'Pop', 'LoFi', 'EDM', 'Drill', 'Afrobeat',
            'Jazz', 'Ambient', 'Rock', 'Country', 'Classical', 'Reggae', 'Blues',
            'Electronic', 'House', 'Techno', 'Dubstep', 'Future Bass', 'Synthwave'
        ],
    },
    tags: [{
            type: String,
            trim: true,
            maxlength: [30, 'Tag cannot exceed 30 characters'],
        }],
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [10000, 'Price cannot exceed $10,000'],
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative'],
        max: [10000, 'Sale price cannot exceed $10,000'],
        validate: {
            validator: function (value) {
                return !value || value < this.price;
            },
            message: 'Sale price must be less than regular price'
        }
    },
    isExclusive: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    isDraft: {
        type: Boolean,
        default: true,
    },
    licenseTypes: {
        free: {
            type: Boolean,
            default: true,
        },
        mp3: {
            type: Boolean,
            default: true,
        },
        wav: {
            type: Boolean,
            default: false,
        },
        stems: {
            type: Boolean,
            default: false,
        },
        exclusive: {
            type: Boolean,
            default: false,
        },
    },
    stats: {
        plays: {
            type: Number,
            default: 0,
            min: [0, 'Plays cannot be negative'],
        },
        likes: {
            type: Number,
            default: 0,
            min: [0, 'Likes cannot be negative'],
        },
        downloads: {
            type: Number,
            default: 0,
            min: [0, 'Downloads cannot be negative'],
        },
        shares: {
            type: Number,
            default: 0,
            min: [0, 'Shares cannot be negative'],
        },
    },
    metadata: {
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 second'],
        },
        fileSize: {
            type: Number,
            required: [true, 'File size is required'],
            min: [1, 'File size must be at least 1 byte'],
        },
        format: {
            type: String,
            required: [true, 'Format is required'],
            enum: ['mp3', 'wav', 'm4a', 'flac'],
        },
        sampleRate: {
            type: Number,
            required: [true, 'Sample rate is required'],
            enum: [44100, 48000, 96000],
        },
        bitRate: {
            type: Number,
            required: [true, 'Bit rate is required'],
            min: [128, 'Bit rate must be at least 128 kbps'],
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
beatSchema.index({ producerId: 1 });
beatSchema.index({ genre: 1 });
beatSchema.index({ bpm: 1 });
beatSchema.index({ musicalKey: 1 });
beatSchema.index({ price: 1 });
beatSchema.index({ isPublished: 1 });
beatSchema.index({ isExclusive: 1 });
beatSchema.index({ tags: 1 });
beatSchema.index({ createdAt: -1 });
beatSchema.index({ 'stats.plays': -1 });
beatSchema.index({ 'stats.likes': -1 });
beatSchema.index({
    title: 'text',
    description: 'text',
    producer: 'text',
    tags: 'text',
    genre: 'text'
});
beatSchema.virtual('currentPrice').get(function () {
    return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});
beatSchema.virtual('discountPercentage').get(function () {
    if (this.salePrice && this.salePrice < this.price) {
        return Math.round(((this.price - this.salePrice) / this.price) * 100);
    }
    return 0;
});
beatSchema.virtual('formattedDuration').get(function () {
    const minutes = Math.floor(this.metadata.duration / 60);
    const seconds = this.metadata.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
beatSchema.virtual('formattedFileSize').get(function () {
    const bytes = this.metadata.fileSize;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0)
        return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});
beatSchema.pre('save', function (next) {
    if (this.isPublished && this.isDraft) {
        this.isDraft = false;
    }
    if (this.isExclusive) {
        this.licenseTypes.free = false;
        this.licenseTypes.mp3 = false;
        this.licenseTypes.wav = false;
        this.licenseTypes.stems = false;
        this.licenseTypes.exclusive = true;
    }
    next();
});
beatSchema.methods.incrementPlays = function () {
    this.stats.plays += 1;
    return this.save();
};
beatSchema.methods.incrementLikes = function () {
    this.stats.likes += 1;
    return this.save();
};
beatSchema.methods.incrementDownloads = function () {
    this.stats.downloads += 1;
    return this.save();
};
beatSchema.methods.incrementShares = function () {
    this.stats.shares += 1;
    return this.save();
};
beatSchema.methods.publish = function () {
    this.isPublished = true;
    this.isDraft = false;
    return this.save();
};
beatSchema.methods.unpublish = function () {
    this.isPublished = false;
    this.isDraft = true;
    return this.save();
};
exports.Beat = mongoose_1.default.model('Beat', beatSchema);
//# sourceMappingURL=beat.model.js.map