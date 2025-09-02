import { IMediaService, UploadRequest, UploadResponse } from './media.interface';
import { IMediaFile } from './media.model';
import { ChunkedUploadSession, ChunkUploadRequest } from '@/utils/chunkedUpload';
export declare class MediaService implements IMediaService {
    generateUploadUrl(request: UploadRequest): Promise<UploadResponse>;
    confirmUpload(userId: string, key: string, fileType: 'audio' | 'image' | 'profile' | 'artwork', beatId?: string): Promise<IMediaFile>;
    getDownloadUrl(userId: string, fileId: string, expiresIn?: number): Promise<string>;
    deleteFile(userId: string, fileId: string): Promise<void>;
    getUserFiles(userId: string, fileType?: string, beatId?: string): Promise<IMediaFile[]>;
    updateFileMetadata(userId: string, fileId: string, metadata: Partial<IMediaFile>): Promise<IMediaFile>;
    private processUploadedFile;
    private getContentTypeFromKey;
    private getProcessingOptions;
    initializeChunkedUpload(request: {
        userId: string;
        fileName: string;
        fileSize: number;
        contentType: string;
        beatId?: string;
        fileType: 'audio' | 'image' | 'profile' | 'artwork';
    }): Promise<ChunkedUploadSession>;
    generateChunkUploadUrl(request: ChunkUploadRequest): Promise<{
        uploadUrl: string;
        chunkKey: string;
        expiresIn: number;
    }>;
    markChunkUploaded(sessionId: string, chunkNumber: number): Promise<void>;
    getUploadProgress(sessionId: string): Promise<{
        uploaded: number;
        total: number;
        percentage: number;
    }>;
    completeChunkedUpload(request: {
        sessionId: string;
        userId: string;
        checksum: string;
    }): Promise<{
        finalKey: string;
        downloadUrl: string;
        mediaFile: IMediaFile;
    }>;
    abortChunkedUpload(sessionId: string): Promise<void>;
    generateHLSStreamingUrl(userId: string, beatId: string, quality?: string): Promise<{
        masterPlaylistUrl: string;
        availableQualities: string[];
        expiresIn: number;
    }>;
    getHLSPlaylist(userId: string, beatId: string, playlistType: 'master' | 'variant', quality?: string): Promise<string>;
    private processAudioFile;
    private getUploadSession;
    cleanupOrphanedFiles(): Promise<void>;
}
//# sourceMappingURL=media.service.d.ts.map