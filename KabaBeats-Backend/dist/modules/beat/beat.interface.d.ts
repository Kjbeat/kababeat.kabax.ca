import { Request } from 'express';
import { IBeat, SearchOptions, PaginatedResult } from '@/types';
export interface BeatRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
export interface CreateBeatData {
    title: string;
    description?: string;
    producer: string;
    artwork?: string;
    audioFile: string;
    bpm: number;
    musicalKey: string;
    genre: string;
    tags?: string[];
    price: number;
    salePrice?: number;
    isExclusive?: boolean;
    licenseTypes?: {
        free?: boolean;
        mp3?: boolean;
        wav?: boolean;
        stems?: boolean;
        exclusive?: boolean;
    };
    metadata: {
        duration: number;
        fileSize: number;
        format: string;
        sampleRate: number;
        bitRate: number;
    };
}
export interface UpdateBeatData {
    title?: string;
    description?: string;
    artwork?: string;
    bpm?: number;
    musicalKey?: string;
    genre?: string;
    tags?: string[];
    price?: number;
    salePrice?: number;
    isExclusive?: boolean;
    licenseTypes?: {
        free?: boolean;
        mp3?: boolean;
        wav?: boolean;
        stems?: boolean;
        exclusive?: boolean;
    };
    isPublished?: boolean;
    isDraft?: boolean;
}
export interface BeatSearchOptions extends SearchOptions {
    producerId?: string | undefined;
    isPublished?: boolean | undefined;
    isExclusive?: boolean | undefined;
}
export interface BeatStats {
    totalBeats: number;
    totalPlays: number;
    totalLikes: number;
    totalDownloads: number;
    totalRevenue: number;
    averagePrice: number;
    topGenres: Array<{
        genre: string;
        count: number;
    }>;
    topKeys: Array<{
        key: string;
        count: number;
    }>;
}
export interface IBeatService {
    createBeat(producerId: string, data: CreateBeatData): Promise<IBeat>;
    getBeatById(beatId: string): Promise<IBeat>;
    getBeatByIdPublic(beatId: string): Promise<IBeat>;
    updateBeat(beatId: string, producerId: string, data: UpdateBeatData): Promise<IBeat>;
    deleteBeat(beatId: string, producerId: string): Promise<void>;
    getBeatsByProducer(producerId: string, options: BeatSearchOptions): Promise<PaginatedResult<IBeat>>;
    searchBeats(options: BeatSearchOptions): Promise<PaginatedResult<IBeat>>;
    getFeaturedBeats(limit?: number): Promise<IBeat[]>;
    getTrendingBeats(limit?: number): Promise<IBeat[]>;
    getNewestBeats(limit?: number): Promise<IBeat[]>;
    getRelatedBeats(beatId: string, limit?: number): Promise<IBeat[]>;
    incrementPlays(beatId: string): Promise<void>;
    incrementLikes(beatId: string): Promise<void>;
    incrementDownloads(beatId: string): Promise<void>;
    incrementShares(beatId: string): Promise<void>;
    publishBeat(beatId: string, producerId: string): Promise<IBeat>;
    unpublishBeat(beatId: string, producerId: string): Promise<IBeat>;
    getBeatStats(producerId?: string): Promise<BeatStats>;
    getBeatAnalytics(beatId: string, producerId: string): Promise<any>;
}
export interface IBeatController {
    createBeat(req: BeatRequest, res: any, next: any): Promise<void>;
    getBeatById(req: BeatRequest, res: any, next: any): Promise<void>;
    updateBeat(req: BeatRequest, res: any, next: any): Promise<void>;
    deleteBeat(req: BeatRequest, res: any, next: any): Promise<void>;
    getMyBeats(req: BeatRequest, res: any, next: any): Promise<void>;
    searchBeats(req: BeatRequest, res: any, next: any): Promise<void>;
    getFeaturedBeats(req: BeatRequest, res: any, next: any): Promise<void>;
    getTrendingBeats(req: BeatRequest, res: any, next: any): Promise<void>;
    getNewestBeats(req: BeatRequest, res: any, next: any): Promise<void>;
    getRelatedBeats(req: BeatRequest, res: any, next: any): Promise<void>;
    incrementPlays(req: BeatRequest, res: any, next: any): Promise<void>;
    incrementLikes(req: BeatRequest, res: any, next: any): Promise<void>;
    incrementDownloads(req: BeatRequest, res: any, next: any): Promise<void>;
    incrementShares(req: BeatRequest, res: any, next: any): Promise<void>;
    publishBeat(req: BeatRequest, res: any, next: any): Promise<void>;
    unpublishBeat(req: BeatRequest, res: any, next: any): Promise<void>;
    getBeatStats(req: BeatRequest, res: any, next: any): Promise<void>;
    getBeatAnalytics(req: BeatRequest, res: any, next: any): Promise<void>;
}
//# sourceMappingURL=beat.interface.d.ts.map