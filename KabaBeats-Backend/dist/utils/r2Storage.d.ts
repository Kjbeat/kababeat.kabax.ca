export declare const FILE_TYPES: {
    readonly AUDIO: {
        readonly allowedTypes: string[];
        readonly maxSize: number;
        readonly folder: "audio";
    };
    readonly IMAGE: {
        readonly allowedTypes: string[];
        readonly maxSize: number;
        readonly folder: "images";
    };
    readonly PROFILE_IMAGE: {
        readonly allowedTypes: string[];
        readonly maxSize: number;
        readonly folder: "profiles";
    };
    readonly BEAT_ARTWORK: {
        readonly allowedTypes: string[];
        readonly maxSize: number;
        readonly folder: "artwork";
    };
};
export declare const STORAGE_PATHS: {
    readonly BEAT_AUDIO: (userId: string, beatId: string, filename: string) => string;
    readonly BEAT_ARTWORK: (userId: string, beatId: string, filename: string) => string;
    readonly PROFILE_IMAGE: (userId: string, filename: string) => string;
    readonly TEMP_UPLOAD: (userId: string, filename: string) => string;
    readonly PROCESSED_AUDIO: (userId: string, beatId: string, filename: string) => string;
};
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
export interface FileMetadata {
    key: string;
    size: number;
    contentType: string;
    uploadedAt: Date;
    userId: string;
    beatId?: string;
}
export declare const generateUploadUrl: (request: UploadRequest) => Promise<UploadResponse>;
export declare const generateDownloadUrl: (key: string, expiresIn?: number) => Promise<string>;
export declare const deleteStorageFile: (key: string) => Promise<void>;
export declare const cleanupTempFiles: (olderThanHours?: number) => Promise<void>;
export declare const parseFileKey: (key: string) => FileMetadata | null;
export declare const generatePublicUrl: (key: string) => string;
export declare const sanitizeFilename: (filename: string) => string;
export declare const getExtensionFromContentType: (contentType: string) => string;
//# sourceMappingURL=r2Storage.d.ts.map