import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
import { IMediaController } from './media.interface';
export declare class MediaController implements IMediaController {
    private mediaService;
    constructor();
    generateUploadUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
    confirmUpload(req: AuthenticatedRequest, res: Response): Promise<void>;
    getDownloadUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteFile(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserFiles(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateFileMetadata(req: AuthenticatedRequest, res: Response): Promise<void>;
    initializeChunkedUpload(req: AuthenticatedRequest, res: Response): Promise<void>;
    generateChunkUploadUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
    markChunkUploaded(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUploadProgress(req: AuthenticatedRequest, res: Response): Promise<void>;
    completeChunkedUpload(req: AuthenticatedRequest, res: Response): Promise<void>;
    abortChunkedUpload(req: AuthenticatedRequest, res: Response): Promise<void>;
    generateHLSStreamingUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
    getHLSPlaylist(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=media.controller.d.ts.map