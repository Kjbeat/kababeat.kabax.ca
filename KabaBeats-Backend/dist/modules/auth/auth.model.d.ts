import mongoose, { Document } from 'mongoose';
import { IUser } from '@/types';
export interface IUserDocument extends IUser, Document {
    _id: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    addRefreshToken(token: string): Promise<void>;
    removeRefreshToken(token: string): Promise<void>;
    clearRefreshTokens(): Promise<void>;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=auth.model.d.ts.map