import { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFile, validateFileType, validateFileSize } from '@/config/cloudflare-r2';
import { logger } from '@/config/logger';

// File type configurations
export const FILE_TYPES = {
  AUDIO: {
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'] as string[],
    maxSize: 200 * 1024 * 1024, // 200MB
    folder: 'audio',
  },
  IMAGE: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as string[],
    maxSize: 25 * 1024 * 1024, // 10MB
    folder: 'images',
  },
  PROFILE_IMAGE: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as string[],
    maxSize: 25 * 1024 * 1024, // 5MB
    folder: 'profiles',
  },
  BEAT_ARTWORK: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as string[],
    maxSize: 25 * 1024 * 1024, // 25MB
    folder: 'artwork',
  },
  STEMS: {
    allowedTypes: ['application/zip', 'application/x-zip-compressed'] as string[],
    maxSize: 5000 * 1024 * 1024, // 500MB
    folder: 'stems',
  },
} as const;

// Storage paths structure
export const STORAGE_PATHS = {
  // Audio files
  BEAT_AUDIO: (userId: string, beatId: string, filename: string) => 
    `audio/beats/${userId}/${beatId}/${filename}`,
  
  // Beat artwork
  BEAT_ARTWORK: (userId: string, beatId: string, filename: string) => 
    `images/artwork/${userId}/${beatId}/${filename}`,
  
  // Profile images
  PROFILE_IMAGE: (userId: string, filename: string) => 
    `images/profiles/${userId}/${filename}`,
  
  // Temporary uploads (for processing)
  TEMP_UPLOAD: (userId: string, filename: string) => 
    `temp/${userId}/${filename}`,
  
  // Processed files
  PROCESSED_AUDIO: (userId: string, beatId: string, filename: string) => 
    `processed/audio/${userId}/${beatId}/${filename}`,
  
  // Stems files
  BEAT_STEMS: (userId: string, beatId: string, filename: string) => 
    `stems/beats/${userId}/${beatId}/${filename}`,
} as const;

export interface UploadRequest {
  userId: string;
  fileType: 'audio' | 'image' | 'profile' | 'artwork' | 'stems';
  originalName: string;
  contentType: string;
  size: number;
  beatId?: string; // Required for beat-related uploads
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

/**
 * Generate upload URL for different file types
 */
export const generateUploadUrl = async (request: UploadRequest): Promise<UploadResponse> => {
  try {
    // Validate file type and size
    const config = getFileConfig(request.fileType);
    
    if (!validateFileType(request.contentType, config.allowedTypes)) {
      throw new Error(`Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`);
    }
    
    if (!validateFileSize(request.size, config.maxSize)) {
      throw new Error(`File too large. Maximum size: ${config.maxSize / (1024 * 1024)}MB`);
    }
    
    // Generate file key based on type
    const key = generateFileKey(request);
    
    // Generate presigned upload URL
    const result = await generatePresignedUploadUrl(key, request.contentType, 3600); // 1 hour
    
    logger.info(`Generated upload URL for ${request.fileType}: ${key}`);
    
    return {
      uploadUrl: result.uploadUrl,
      key: result.key,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    logger.error('Error generating upload URL:', error);
    throw error;
  }
};

/**
 * Generate download URL for a file
 */
export const generateDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const downloadUrl = await generatePresignedDownloadUrl(key, expiresIn);
    logger.info(`Generated download URL for: ${key}`);
    return downloadUrl;
  } catch (error) {
    logger.error('Error generating download URL:', error);
    throw error;
  }
};

/**
 * Delete a file from storage
 */
export const deleteStorageFile = async (key: string): Promise<void> => {
  try {
    await deleteFile(key);
    logger.info(`Deleted file from storage: ${key}`);
  } catch (error) {
    logger.error('Error deleting file from storage:', error);
    throw error;
  }
};

/**
 * Generate file key based on upload request
 */
const generateFileKey = (request: UploadRequest): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = request.originalName.split('.').pop();
  
  switch (request.fileType) {
    case 'audio':
      if (!request.beatId) throw new Error('Beat ID required for audio uploads');
      return STORAGE_PATHS.BEAT_AUDIO(request.userId, request.beatId, `${timestamp}-${randomString}.${extension}`);
    
    case 'artwork':
      if (!request.beatId) throw new Error('Beat ID required for artwork uploads');
      return STORAGE_PATHS.BEAT_ARTWORK(request.userId, request.beatId, `${timestamp}-${randomString}.${extension}`);
    
    case 'profile':
      return STORAGE_PATHS.PROFILE_IMAGE(request.userId, `${timestamp}-${randomString}.${extension}`);
    
    case 'image':
      return STORAGE_PATHS.TEMP_UPLOAD(request.userId, `${timestamp}-${randomString}.${extension}`);
    
    case 'stems':
      if (!request.beatId) throw new Error('Beat ID required for stems uploads');
      return STORAGE_PATHS.BEAT_STEMS(request.userId, request.beatId, `${timestamp}-${randomString}.${extension}`);
    
    default:
      throw new Error(`Unknown file type: ${request.fileType}`);
  }
};

/**
 * Get file configuration based on type
 */
const getFileConfig = (fileType: string) => {
  switch (fileType) {
    case 'audio':
      return FILE_TYPES.AUDIO;
    case 'image':
      return FILE_TYPES.IMAGE;
    case 'profile':
      return FILE_TYPES.PROFILE_IMAGE;
    case 'artwork':
      return FILE_TYPES.BEAT_ARTWORK;
    case 'stems':
      return FILE_TYPES.STEMS;
    default:
      throw new Error(`Unknown file type: ${fileType}`);
  }
};

/**
 * Clean up temporary files older than specified hours
 */
export const cleanupTempFiles = async (olderThanHours: number = 24): Promise<void> => {
  try {
    // This would require listing objects in the temp folder
    // Implementation depends on your cleanup strategy
    logger.info(`Cleanup temp files older than ${olderThanHours} hours`);
  } catch (error) {
    logger.error('Error cleaning up temp files:', error);
    throw error;
  }
};

/**
 * Get file metadata from key
 */
export const parseFileKey = (key: string): FileMetadata | null => {
  try {
    const parts = key.split('/');
    
    if (parts.length < 3) return null;
    
    const [type, subfolder, userId, ...rest] = parts;
      const filename = rest[rest.length - 1];
  if (!filename) return null;
  const [timestamp, randomString, extension] = filename.split('.')[0]?.split('-') || [];
    
    return {
      key,
      size: 0, // Would need to get from S3 metadata
      contentType: '', // Would need to get from S3 metadata
      uploadedAt: new Date(parseInt(timestamp || '0')),
      userId: userId || '',
      beatId: type === 'audio' || type === 'artwork' ? rest[0] : undefined as any,
    };
  } catch (error) {
    logger.error('Error parsing file key:', error);
    return null;
  }
};

/**
 * Generate public URL for a file (if using public bucket)
 */
export const generatePublicUrl = (key: string): string => {
  const bucketUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_ENDPOINT;
  return `${bucketUrl}/${key}`;
};

/**
 * Validate and sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .toLowerCase();
};

/**
 * Get file extension from content type
 */
export const getExtensionFromContentType = (contentType: string): string => {
  const extensions: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp3': 'mp3',
    'audio/m4a': 'm4a',
    'audio/flac': 'flac',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  
  return extensions[contentType] || 'bin';
};
