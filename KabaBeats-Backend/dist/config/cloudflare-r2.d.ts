import { S3Client } from '@aws-sdk/client-s3';
declare const r2Client: S3Client;
declare const BUCKET_NAME: string;
export interface UploadResult {
    key: string;
    url: string;
    size: number;
    contentType: string;
}
export interface PresignedUrlResult {
    uploadUrl: string;
    key: string;
    expiresIn: number;
}
export declare const generatePresignedUploadUrl: (key: string, contentType: string, expiresIn?: number) => Promise<PresignedUrlResult>;
export declare const generatePresignedDownloadUrl: (key: string, expiresIn?: number) => Promise<string>;
export declare const deleteFile: (key: string) => Promise<void>;
export declare const generateFileKey: (originalName: string, folder?: string) => string;
export declare const validateFileType: (contentType: string, allowedTypes: string[]) => boolean;
export declare const validateFileSize: (size: number, maxSize: number) => boolean;
export { r2Client, BUCKET_NAME };
//# sourceMappingURL=cloudflare-r2.d.ts.map