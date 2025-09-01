import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/config/logger';

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION || 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

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

/**
 * Generate a presigned URL for uploading files to Cloudflare R2
 */
export const generatePresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<PresignedUrlResult> => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
    
    logger.info(`Generated presigned upload URL for key: ${key}`);
    
    return {
      uploadUrl,
      key,
      expiresIn,
    };
  } catch (error) {
    logger.error('Error generating presigned upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Generate a presigned URL for downloading files from Cloudflare R2
 */
export const generatePresignedDownloadUrl = async (
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn });
    
    logger.info(`Generated presigned download URL for key: ${key}`);
    
    return downloadUrl;
  } catch (error) {
    logger.error('Error generating presigned download URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Delete a file from Cloudflare R2
 */
export const deleteFile = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    
    logger.info(`Deleted file from R2: ${key}`);
  } catch (error) {
    logger.error('Error deleting file from R2:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Generate a unique file key with timestamp and random string
 */
export const generateFileKey = (originalName: string, folder: string = 'uploads'): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${folder}/${timestamp}-${randomString}.${extension}`;
};

/**
 * Validate file type based on allowed types
 */
export const validateFileType = (contentType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(contentType);
};

/**
 * Validate file size
 */
export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

export { r2Client, BUCKET_NAME };
