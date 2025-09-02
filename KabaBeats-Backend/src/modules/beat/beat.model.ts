import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '@/types';

export interface IBeat extends Document {
  title: string;
  producer: string;
  description?: string;
  artwork?: string;
  audioFile?: string;
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags: string[];
  
  // Licensing
  allowFreeDownload: boolean;
  
  // Audio processing
  duration?: number;
  fileSize?: number;
  audioFormat: 'mp3' | 'wav' | 'm4a';
  sampleRate?: number;
  bitrate?: number;
  
  // HLS streaming
  hlsUrl?: string;
  hlsProcessed: boolean;
  hlsSegments?: {
    high?: string;
    medium?: string;
    low?: string;
  };
  
  // File storage
  storageKey?: string;
  originalFileName?: string;
  
  // Stems storage
  stemsStorageKey?: string;
  stemsOriginalFileName?: string;
  stemsFileSize?: number;
  
  // Metadata
  uploadDate: Date;
  lastModified: Date;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledDate?: Date;
  
  // Analytics
  plays: number;
  likes: number;
  downloads: number;
  sales: number;
  
  // Collaborators
  collaborators: {
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    percent: number;
    role?: string;
  }[];
  
  // Owner
  owner: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const BeatSchema = new Schema<IBeat>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  producer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  artwork: {
    type: String,
    trim: true
  },
  audioFile: {
    type: String,
    trim: true
  },
  bpm: {
    type: Number,
    required: true,
    min: 60,
    max: 300
  },
  key: {
    type: String,
    required: true,
    enum: [
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
      'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor', 
      'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor',
      'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major', 
      'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major'
    ]
  },
  genre: {
    type: String,
    required: true,
    enum: [
      'Hip Hop', 'Trap', 'R&B', 'Pop', 'LoFi', 'EDM', 'Drill', 'Afrobeat', 
      'Jazz', 'Ambient', 'Rock', 'Country', 'Classical', 'Reggae', 'Blues'
    ]
  },
  mood: {
    type: String,
    enum: [
      'Chill', 'Energetic', 'Dark', 'Happy', 'Sad', 'Aggressive', 
      'Romantic', 'Mysterious', 'Upbeat', 'Melancholic', 'Intense', 'Peaceful'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  
  // Licensing
  allowFreeDownload: {
    type: Boolean,
    default: false
  },
  
  // Audio processing
  duration: {
    type: Number,
    min: 0
  },
  fileSize: {
    type: Number,
    min: 0
  },
  audioFormat: {
    type: String,
    enum: ['mp3', 'wav', 'm4a'],
    default: 'mp3'
  },
  sampleRate: {
    type: Number,
    min: 0
  },
  bitrate: {
    type: Number,
    min: 0
  },
  
  // HLS streaming
  hlsUrl: {
    type: String,
    trim: true
  },
  hlsProcessed: {
    type: Boolean,
    default: false
  },
  hlsSegments: {
    high: String,
    medium: String,
    low: String
  },
  
  // File storage
  storageKey: {
    type: String,
    required: false,
    trim: true
  },
  originalFileName: {
    type: String,
    required: false,
    trim: true
  },
  
  // Stems storage
  stemsStorageKey: {
    type: String,
    required: false,
    trim: true
  },
  stemsOriginalFileName: {
    type: String,
    required: false,
    trim: true
  },
  stemsFileSize: {
    type: Number,
    required: false,
    min: 0
  },
  
  // Metadata
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date
  },
  
  // Analytics
  plays: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  sales: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Collaborators
  collaborators: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: false,
      trim: true
    },
    percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    role: {
      type: String,
      trim: true
    }
  }],
  
  // Owner
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
BeatSchema.index({ title: 'text', description: 'text', tags: 'text' });
BeatSchema.index({ genre: 1, mood: 1 });
BeatSchema.index({ bpm: 1, key: 1 });
BeatSchema.index({ status: 1, uploadDate: -1 });
BeatSchema.index({ owner: 1, status: 1 });
BeatSchema.index({ plays: -1 });
BeatSchema.index({ likes: -1 });
BeatSchema.index({ sales: -1 });

// Virtual for current price (will be calculated from user license settings)
BeatSchema.virtual('currentPrice').get(function() {
  // This will be populated from user license settings when needed
  return 0;
});

// Virtual for total collaborator percentage
BeatSchema.virtual('totalCollaboratorPercent').get(function() {
  return this.collaborators.reduce((total, collab) => total + collab.percent, 0);
});

// Virtual for owner percentage
BeatSchema.virtual('ownerPercent').get(function() {
  const totalCollaboratorPercent = this.collaborators.reduce((total, collab) => total + collab.percent, 0);
  return Math.max(0, 100 - totalCollaboratorPercent);
});

// Pre-save middleware to update lastModified
BeatSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Method to increment plays
BeatSchema.methods.incrementPlays = function() {
  this.plays += 1;
  return this.save();
};

// Method to increment likes
BeatSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Method to increment downloads
BeatSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Method to increment sales
BeatSchema.methods.incrementSales = function() {
  this.sales += 1;
  return this.save();
};

// Static method to find beats by genre
BeatSchema.statics.findByGenre = function(genre: string) {
  return this.find({ genre, status: 'published' });
};

// Static method to find beats by mood
BeatSchema.statics.findByMood = function(mood: string) {
  return this.find({ mood, status: 'published' });
};

// Static method to find beats by BPM range
BeatSchema.statics.findByBPMRange = function(minBPM: number, maxBPM: number) {
  return this.find({ 
    bpm: { $gte: minBPM, $lte: maxBPM }, 
    status: 'published' 
  });
};

// Static method to find beats by price range
BeatSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({ 
    $or: [
      { basePrice: { $gte: minPrice, $lte: maxPrice } },
      { salePrice: { $gte: minPrice, $lte: maxPrice } }
    ],
    status: 'published' 
  });
};

export const Beat = mongoose.model<IBeat>('Beat', BeatSchema);