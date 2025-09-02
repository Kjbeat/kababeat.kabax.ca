export interface ChunkedUploadSession {
    sessionId: string;
    userId: string;
    fileName: string;
    fileSize: number;
    chunkSize: number;
    totalChunks: number;
    uploadedChunks: Set<number>;
    contentType: string;
    beatId?: string;
    fileType: 'audio' | 'image' | 'profile' | 'artwork';
    createdAt: Date;
    expiresAt: Date;
}
export interface ChunkUploadRequest {
    sessionId: string;
    chunkNumber: number;
    chunkSize: number;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    contentType: string;
    userId: string;
    beatId?: string;
    fileType: 'audio' | 'image' | 'profile' | 'artwork';
}
export interface ChunkUploadResponse {
    uploadUrl: string;
    chunkKey: string;
    expiresIn: number;
}
export interface CompleteUploadRequest {
    sessionId: string;
    userId: string;
    checksum: string;
}
export declare const CHUNK_CONFIG: {
    readonly DEFAULT_CHUNK_SIZE: number;
    readonly MIN_CHUNK_SIZE: number;
    readonly MAX_CHUNK_SIZE: number;
    readonly MAX_FILE_SIZE: number;
    readonly SESSION_EXPIRY: number;
};
export declare const initializeChunkedUpload: (request: {
    userId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    beatId?: string;
    fileType: "audio" | "image" | "profile" | "artwork";
    chunkSize?: number;
}) => Promise<ChunkedUploadSession>;
export declare const generateChunkUploadUrl: (request: ChunkUploadRequest) => Promise<ChunkUploadResponse>;
export declare const markChunkUploaded: (sessionId: string, chunkNumber: number) => Promise<void>;
export declare const isUploadComplete: (sessionId: string) => Promise<boolean>;
export declare const getUploadProgress: (sessionId: string) => Promise<{
    uploaded: number;
    total: number;
    percentage: number;
}>;
export declare const completeChunkedUpload: (request: CompleteUploadRequest) => Promise<{
    finalKey: string;
    downloadUrl: string;
}>;
export declare const abortChunkedUpload: (sessionId: string) => Promise<void>;
export declare const cleanupExpiredSessions: () => Promise<void>;
export declare const calculateOptimalChunkSize: (fileSize: number) => number;
//# sourceMappingURL=chunkedUpload.d.ts.map