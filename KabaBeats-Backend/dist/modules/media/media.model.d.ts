import mongoose, { Document } from 'mongoose';
import { MediaMetadata } from './media.interface';
export interface IMediaFile extends Document {
    key: string;
    processedKey?: string;
    thumbnailKey?: string;
    userId: string;
    beatId?: string;
    fileType: 'audio' | 'image' | 'profile' | 'artwork';
    title?: string;
    description?: string;
    tags?: string[];
    isPublic: boolean;
    metadata: MediaMetadata;
    status: 'uploading' | 'processing' | 'processed' | 'failed';
    uploadedAt: Date;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MediaFile: mongoose.Model<IMediaFile, {}, {}, {}, mongoose.Document<unknown, {}, IMediaFile, {}, {}> & IMediaFile & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=media.model.d.ts.map