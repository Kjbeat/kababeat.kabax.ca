import { IBeatService, CreateBeatData, UpdateBeatData, BeatSearchOptions, BeatStats } from './beat.interface';
import { IBeat, PaginatedResult } from '@/types';
export declare class BeatService implements IBeatService {
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
//# sourceMappingURL=beat.service.d.ts.map