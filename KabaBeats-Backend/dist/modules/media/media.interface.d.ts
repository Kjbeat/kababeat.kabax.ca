import { IMediaFile } from './media.model';
import { ChunkedUploadSession, ChunkUploadRequest } from '@/utils/chunkedUpload';
export interface IMediaService {
    generateUploadUrl(request: UploadRequest): Promise<UploadResponse>;
    confirmUpload(userId: string, key: string, fileType: 'audio' | 'image' | 'profile' | 'artwork', beatId?: string): Promise<IMediaFile>;
    getDownloadUrl(userId: string, fileId: string, expiresIn?: number): Promise<string>;
    deleteFile(userId: string, fileId: string): Promise<void>;
    getUserFiles(userId: string, fileType?: string, beatId?: string): Promise<IMediaFile[]>;
    updateFileMetadata(userId: string, fileId: string, metadata: Partial<IMediaFile>): Promise<IMediaFile>;
    cleanupOrphanedFiles(): Promise<void>;
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
}
export interface IMediaController {
    generateUploadUrl(req: any, res: any): Promise<void>;
    confirmUpload(req: any, res: any): Promise<void>;
    getDownloadUrl(req: any, res: any): Promise<void>;
    deleteFile(req: any, res: any): Promise<void>;
    getUserFiles(req: any, res: any): Promise<void>;
    updateFileMetadata(req: any, res: any): Promise<void>;
    initializeChunkedUpload(req: any, res: any): Promise<void>;
    generateChunkUploadUrl(req: any, res: any): Promise<void>;
    markChunkUploaded(req: any, res: any): Promise<void>;
    getUploadProgress(req: any, res: any): Promise<void>;
    completeChunkedUpload(req: any, res: any): Promise<void>;
    abortChunkedUpload(req: any, res: any): Promise<void>;
    generateHLSStreamingUrl(req: any, res: any): Promise<void>;
    getHLSPlaylist(req: any, res: any): Promise<void>;
}
export interface UploadRequest {
    userId: string;
    fileType: 'audio' | 'image' | 'profile' | 'artwork';
    originalName: string;
    contentType: string;
    size: number;
    beatId?: string;
}
export interface UploadResponse {
    uploadUrl: string;
    key: string;
    expiresIn: number;
    publicUrl?: string;
}
export interface MediaMetadata {
    duration?: number;
    bitrate?: number;
    sampleRate?: number;
    width?: number;
    height?: number;
    format: string;
    size: number;
}
export interface ProcessingResult {
    originalKey: string;
    processedKey?: string;
    thumbnailKey?: string;
    metadata: MediaMetadata;
}
//# sourceMappingURL=media.interface.d.ts.map