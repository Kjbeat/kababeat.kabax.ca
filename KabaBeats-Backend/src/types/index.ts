import { Document } from 'mongoose';

// Base interface for all documents
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// User related types
export interface IUser extends BaseDocument {
  email: string;
  username: string;
  password?: string; // Optional for OAuth users
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  role: 'user' | 'creator' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  refreshTokens: string[];
  // OAuth fields
  googleId?: string;
  facebookId?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

// Beat related types
export interface IBeat extends BaseDocument {
  title: string;
  description?: string;
  producer: string;
  producerId: string;
  artwork?: string;
  audioFile: string;
  bpm: number;
  musicalKey: string;
  genre: string;
  tags: string[];
  price: number;
  salePrice?: number;
  isExclusive: boolean;
  isPublished: boolean;
  isDraft: boolean;
  licenseTypes: {
    free: boolean;
    mp3: boolean;
    wav: boolean;
    stems: boolean;
    exclusive: boolean;
  };
  stats: {
    plays: number;
    likes: number;
    downloads: number;
    shares: number;
  };
  metadata: {
    duration: number;
    fileSize: number;
    format: string;
    sampleRate: number;
    bitRate: number;
  };
}

// Playlist related types
export interface IPlaylist extends BaseDocument {
  title: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  curator: string;
  curatorId: string;
  beats: string[]; // Array of beat IDs
  tags: string[];
  stats: {
    plays: number;
    likes: number;
    shares: number;
  };
}

// Connection/Follower types
export interface IConnection extends BaseDocument {
  follower: string; // User ID who is following
  following: string; // User ID being followed
  status: 'pending' | 'accepted' | 'blocked';
}

// Purchase/License types
export interface IPurchase extends BaseDocument {
  buyer: string; // User ID
  beat: string; // Beat ID
  licenseType: 'free' | 'mp3' | 'wav' | 'stems' | 'exclusive';
  price: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  downloadUrl?: string;
  expiresAt?: Date;
}

// Notification types
export interface INotification extends BaseDocument {
  recipient: string; // User ID
  sender?: string; // User ID (optional for system notifications)
  type: 'like' | 'follow' | 'purchase' | 'comment' | 'system';
  title: string;
  message: string;
  data?: any; // Additional data for the notification
  isRead: boolean;
  readAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Search and filter types
export interface BeatFilters {
  genre?: string;
  bpm?: number;
  musicalKey?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  isExclusive?: boolean;
  producer?: string;
}

export interface SearchOptions {
  query?: string | undefined;
  filters?: BeatFilters | undefined;
  sort?: string | undefined;
  pagination?: PaginationOptions | undefined;
}
