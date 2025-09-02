import mongoose, { Document } from 'mongoose';
export interface IPlaylist extends Document {
    _id: string;
    title: string;
    description: string;
    coverImage?: string;
    isPublic: boolean;
    trackCount: number;
    curator: mongoose.Types.ObjectId;
    curatorName: string;
    curatorAvatar?: string;
    tracks: mongoose.Types.ObjectId[];
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
export declare const Playlist: mongoose.Model<IPlaylist, {}, {}, {}, mongoose.Document<unknown, {}, IPlaylist, {}, {}> & IPlaylist & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=playlist.model.d.ts.map