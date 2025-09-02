import mongoose, { Document } from 'mongoose';
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
export declare const UserProfile: mongoose.Model<IUserProfile, {}, {}, {}, mongoose.Document<unknown, {}, IUserProfile, {}, {}> & IUserProfile & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=user.model.d.ts.map