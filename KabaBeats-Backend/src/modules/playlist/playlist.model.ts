import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylist extends Document {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  isPublic: boolean;
  trackCount: number;
  curator: mongoose.Types.ObjectId; // User ID
  curatorName: string; // Cached curator name for performance
  curatorAvatar?: string; // Cached curator avatar
  tracks: mongoose.Types.ObjectId[]; // Array of beat IDs
  tags: string[];
  genre?: string;
  mood?: string;
  totalPlays: number;
  totalLikes: number;
  totalShares: number;
  isFeatured: boolean;
  isCurated: boolean;
  featuredAt?: Date;
  lastPlayedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>({
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
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
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

// Virtual for duration (would need to calculate from tracks)
playlistSchema.virtual('duration').get(function() {
  // This would be calculated from the sum of track durations
  return 0; // Placeholder
});

// Virtual for updated time display
playlistSchema.virtual('updatedTimeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - (this as any).updatedAt.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Just now';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
});

// Indexes for better performance
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

// Methods
playlistSchema.methods.addTrack = async function(beatId: string) {
  if (!this.tracks.includes(beatId)) {
    this.tracks.push(beatId);
    this.trackCount = this.tracks.length;
    await this.save();
  }
};

playlistSchema.methods.removeTrack = async function(beatId: string) {
  this.tracks = this.tracks.filter((id: mongoose.Types.ObjectId) => id.toString() !== beatId);
  this.trackCount = this.tracks.length;
  await this.save();
};

playlistSchema.methods.reorderTracks = async function(trackIds: string[]) {
  // Validate that all current tracks are included
  const currentTrackIds = this.tracks.map((id: mongoose.Types.ObjectId) => id.toString());
  const isValid = trackIds.every(id => currentTrackIds.includes(id)) && 
                  trackIds.length === currentTrackIds.length;
  
  if (!isValid) {
    throw new Error('Invalid track reorder: all tracks must be included');
  }
  
  this.tracks = trackIds;
  await this.save();
};

playlistSchema.methods.incrementPlays = async function(count: number = 1) {
  this.totalPlays += count;
  this.lastPlayedAt = new Date();
  await this.save();
};

playlistSchema.methods.incrementLikes = async function(count: number = 1) {
  this.totalLikes += count;
  await this.save();
};

playlistSchema.methods.incrementShares = async function(count: number = 1) {
  this.totalShares += count;
  await this.save();
};

playlistSchema.methods.setFeatured = async function(featured: boolean) {
  this.isFeatured = featured;
  this.featuredAt = featured ? new Date() : undefined;
  await this.save();
};

playlistSchema.methods.updateCuratorInfo = async function(name: string, avatar?: string) {
  this.curatorName = name;
  if (avatar) {
    this.curatorAvatar = avatar;
  }
  await this.save();
};

// Static methods
playlistSchema.statics.findByCurator = function(curatorId: string, isPublic?: boolean) {
  const query: any = { curator: curatorId };
  if (isPublic !== undefined) {
    query.isPublic = isPublic;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

playlistSchema.statics.findFeatured = function(limit: number = 10) {
  return this.find({ isFeatured: true, isPublic: true })
    .populate('curator', 'username firstName lastName avatar')
    .sort({ featuredAt: -1 })
    .limit(limit);
};

playlistSchema.statics.findTrending = function(limit: number = 20) {
  return this.find({ isPublic: true })
    .populate('curator', 'username firstName lastName avatar')
    .sort({ totalPlays: -1, totalLikes: -1 })
    .limit(limit);
};

playlistSchema.statics.searchPlaylists = function(query: string, limit: number = 20) {
  return this.find({
    $text: { $search: query },
    isPublic: true
  })
    .populate('curator', 'username firstName lastName avatar')
    .sort({ score: { $meta: 'textScore' }, totalPlays: -1 })
    .limit(limit);
};

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
