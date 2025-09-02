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
exports.Playlist = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const playlistSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Playlist title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: '',
    },
    coverImage: {
        type: String,
        default: null,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    trackCount: {
        type: Number,
        default: 0,
    },
    curator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'UserProfile',
        required: [true, 'Curator is required'],
    },
    curatorName: {
        type: String,
        required: [true, 'Curator name is required'],
    },
    curatorAvatar: {
        type: String,
        default: null,
    },
    tracks: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Beat',
        }],
    tags: [{
            type: String,
            trim: true,
        }],
    genre: {
        type: String,
        trim: true,
    },
    mood: {
        type: String,
        trim: true,
    },
    totalPlays: {
        type: Number,
        default: 0,
    },
    totalLikes: {
        type: Number,
        default: 0,
    },
    totalShares: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isCurated: {
        type: Boolean,
        default: false,
    },
    featuredAt: {
        type: Date,
        default: null,
    },
    lastPlayedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
playlistSchema.virtual('duration').get(function () {
    return 0;
});
playlistSchema.virtual('updatedTimeAgo').get(function () {
    const now = new Date();
    const diff = now.getTime() - this.updatedAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0)
        return 'Just now';
    if (days === 1)
        return '1 day ago';
    if (days < 7)
        return `${days} days ago`;
    if (days < 30)
        return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
});
playlistSchema.index({ curator: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ isFeatured: 1 });
playlistSchema.index({ isCurated: 1 });
playlistSchema.index({ totalPlays: -1 });
playlistSchema.index({ totalLikes: -1 });
playlistSchema.index({ createdAt: -1 });
playlistSchema.index({ updatedAt: -1 });
playlistSchema.index({ tags: 1 });
playlistSchema.index({ genre: 1 });
playlistSchema.index({ mood: 1 });
playlistSchema.index({ title: 'text', description: 'text', tags: 'text' });
playlistSchema.methods.addTrack = async function (beatId) {
    if (!this.tracks.includes(beatId)) {
        this.tracks.push(beatId);
        this.trackCount = this.tracks.length;
        await this.save();
    }
};
playlistSchema.methods.removeTrack = async function (beatId) {
    this.tracks = this.tracks.filter((id) => id.toString() !== beatId);
    this.trackCount = this.tracks.length;
    await this.save();
};
playlistSchema.methods.reorderTracks = async function (trackIds) {
    const currentTrackIds = this.tracks.map((id) => id.toString());
    const isValid = trackIds.every(id => currentTrackIds.includes(id)) &&
        trackIds.length === currentTrackIds.length;
    if (!isValid) {
        throw new Error('Invalid track reorder: all tracks must be included');
    }
    this.tracks = trackIds;
    await this.save();
};
playlistSchema.methods.incrementPlays = async function (count = 1) {
    this.totalPlays += count;
    this.lastPlayedAt = new Date();
    await this.save();
};
playlistSchema.methods.incrementLikes = async function (count = 1) {
    this.totalLikes += count;
    await this.save();
};
playlistSchema.methods.incrementShares = async function (count = 1) {
    this.totalShares += count;
    await this.save();
};
playlistSchema.methods.setFeatured = async function (featured) {
    this.isFeatured = featured;
    this.featuredAt = featured ? new Date() : undefined;
    await this.save();
};
playlistSchema.methods.updateCuratorInfo = async function (name, avatar) {
    this.curatorName = name;
    if (avatar) {
        this.curatorAvatar = avatar;
    }
    await this.save();
};
playlistSchema.statics.findByCurator = function (curatorId, isPublic) {
    const query = { curator: curatorId };
    if (isPublic !== undefined) {
        query.isPublic = isPublic;
    }
    return this.find(query).sort({ updatedAt: -1 });
};
playlistSchema.statics.findFeatured = function (limit = 10) {
    return this.find({ isFeatured: true, isPublic: true })
        .populate('curator', 'username firstName lastName avatar')
        .sort({ featuredAt: -1 })
        .limit(limit);
};
playlistSchema.statics.findTrending = function (limit = 20) {
    return this.find({ isPublic: true })
        .populate('curator', 'username firstName lastName avatar')
        .sort({ totalPlays: -1, totalLikes: -1 })
        .limit(limit);
};
playlistSchema.statics.searchPlaylists = function (query, limit = 20) {
    return this.find({
        $text: { $search: query },
        isPublic: true
    })
        .populate('curator', 'username firstName lastName avatar')
        .sort({ score: { $meta: 'textScore' }, totalPlays: -1 })
        .limit(limit);
};
exports.Playlist = mongoose_1.default.model('Playlist', playlistSchema);
//# sourceMappingURL=playlist.model.js.map