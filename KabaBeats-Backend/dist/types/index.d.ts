import { Document } from 'mongoose';
export interface BaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
}
export interface IUser extends BaseDocument {
    email: string;
    username: string;
    password?: string;
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
    emailVerificationOTP?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    googleId?: string;
    facebookId?: string;
    socialLinks?: {
        website?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
    };
    themePreferences?: {
        mode: 'light' | 'dark' | 'system';
        customTheme?: {
            primary: string;
            accent: string;
            radius: number;
        };
    };
}
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
export interface IPlaylist extends BaseDocument {
    title: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    curator: string;
    curatorId: string;
    beats: string[];
    tags: string[];
    stats: {
        plays: number;
        likes: number;
        shares: number;
    };
}
export interface IConnection extends BaseDocument {
    follower: string;
    following: string;
    status: 'pending' | 'accepted' | 'blocked';
}
export interface IPurchase extends BaseDocument {
    buyer: string;
    beat: string;
    licenseType: 'free' | 'mp3' | 'wav' | 'stems' | 'exclusive';
    price: number;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentId?: string;
    downloadUrl?: string;
    expiresAt?: Date;
}
export interface INotification extends BaseDocument {
    recipient: string;
    sender?: string;
    type: 'like' | 'follow' | 'purchase' | 'comment' | 'system';
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    readAt?: Date;
}
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
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
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
//# sourceMappingURL=index.d.ts.map