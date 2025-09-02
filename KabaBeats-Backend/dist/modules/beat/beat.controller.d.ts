import { Response, NextFunction } from 'express';
import { IBeatController, BeatRequest } from './beat.interface';
export declare class BeatController implements IBeatController {
    private beatService;
    constructor();
    createBeat: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getBeatById: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    updateBeat: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteBeat: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getMyBeats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    searchBeats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getFeaturedBeats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getTrendingBeats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getNewestBeats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getRelatedBeats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    incrementPlays: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    incrementLikes: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    incrementDownloads: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    incrementShares: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    publishBeat: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    unpublishBeat: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getBeatStats: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
    getBeatAnalytics: (req: BeatRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=beat.controller.d.ts.map