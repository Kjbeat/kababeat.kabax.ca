import { logger } from '@/config/logger';
import { deleteStorageFile } from './r2Storage';

export interface MediaProcessingOptions {
  audio?: {
    quality?: 'low' | 'medium' | 'high';
    format?: 'mp3' | 'wav' | 'm4a';
    bitrate?: number;
  };
  image?: {
    quality?: number; // 1-100
    format?: 'jpeg' | 'png' | 'webp';
    maxWidth?: number;
    maxHeight?: number;
    generateThumbnail?: boolean;
  };
}

export interface ProcessingResult {
  originalKey: string;
  processedKey?: string;
  thumbnailKey?: string;
  metadata: {
    duration?: number; // for audio
    bitrate?: number; // for audio
    sampleRate?: number; // for audio
    width?: number; // for images
    height?: number; // for images
    format: string;
    size: number;
  };
}

/**
 * Process uploaded media files
 */
export const processMediaFile = async (
  key: string,
  contentType: string,
  options: MediaProcessingOptions = {}
): Promise<ProcessingResult> => {
  try {
    if (contentType.startsWith('audio/')) {
      return await processAudioFile(key, contentType, options.audio);
    } else if (contentType.startsWith('image/')) {
      return await processImageFile(key, contentType, options.image);
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
  } catch (error) {
    logger.error('Error processing media file:', error);
    throw error;
  }
};

/**
 * Process audio files
 */
const processAudioFile = async (
  key: string,
  contentType: string,
  options: MediaProcessingOptions['audio'] = {}
): Promise<ProcessingResult> => {
  try {
    // For now, we'll return the original file
    // In production, you'd use FFmpeg or similar to process audio
    
    const metadata = await extractAudioMetadata(key);
    
    logger.info(`Processed audio file: ${key}`);
    
    return {
      originalKey: key,
      metadata: {
        ...metadata,
        format: contentType,
        size: 0, // Would get from S3 metadata
      },
    };
  } catch (error) {
    logger.error('Error processing audio file:', error);
    throw error;
  }
};

/**
 * Process image files
 */
const processImageFile = async (
  key: string,
  contentType: string,
  options: MediaProcessingOptions['image'] = {}
): Promise<ProcessingResult> => {
  try {
    // For now, we'll return the original file
    // In production, you'd use Sharp or similar to process images
    
    const metadata = await extractImageMetadata(key);
    
    // Generate thumbnail if requested
    let thumbnailKey: string | undefined;
    if (options.generateThumbnail) {
      thumbnailKey = await generateThumbnail(key, options);
    }
    
    logger.info(`Processed image file: ${key}`);
    
    return {
      originalKey: key,
      thumbnailKey: thumbnailKey ?? "",
      metadata: {
        ...metadata,
        format: contentType,
        size: 0, // Would get from S3 metadata
      },
    };
  } catch (error) {
    logger.error('Error processing image file:', error);
    throw error;
  }
};

/**
 * Extract audio metadata
 */
const extractAudioMetadata = async (key: string): Promise<Partial<ProcessingResult['metadata']>> => {
  try {
    // In production, you'd use FFprobe or similar to extract metadata
    // For now, return default values
    
    return {
      duration: 0,
      bitrate: 128,
      sampleRate: 44100,
    };
  } catch (error) {
    logger.error('Error extracting audio metadata:', error);
    return {};
  }
};

/**
 * Extract image metadata
 */
const extractImageMetadata = async (key: string): Promise<Partial<ProcessingResult['metadata']>> => {
  try {
    // In production, you'd use Sharp or similar to extract metadata
    // For now, return default values
    
    return {
      width: 0,
      height: 0,
    };
  } catch (error) {
    logger.error('Error extracting image metadata:', error);
    return {};
  }
};

/**
 * Generate thumbnail for image
 */
const generateThumbnail = async (
  key: string,
  options: MediaProcessingOptions['image'] = {}
): Promise<string> => {
  try {
    // In production, you'd use Sharp to generate thumbnails
    // For now, return a placeholder key
    
    const thumbnailKey = key.replace('/images/', '/thumbnails/').replace(/\.[^/.]+$/, '_thumb.jpg');
    
    logger.info(`Generated thumbnail: ${thumbnailKey}`);
    
    return thumbnailKey;
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    throw error;
  }
};

/**
 * Validate audio file
 */
export const validateAudioFile = (contentType: string, size: number): boolean => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  return allowedTypes.includes(contentType) && size <= maxSize;
};

/**
 * Validate image file
 */
export const validateImageFile = (contentType: string, size: number): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return allowedTypes.includes(contentType) && size <= maxSize;
};

/**
 * Get optimal image dimensions for different use cases
 */
export const getImageDimensions = (useCase: 'profile' | 'artwork' | 'thumbnail'): { width: number; height: number } => {
  switch (useCase) {
    case 'profile':
      return { width: 400, height: 400 };
    case 'artwork':
      return { width: 1200, height: 1200 };
    case 'thumbnail':
      return { width: 300, height: 300 };
    default:
      return { width: 800, height: 600 };
  }
};

/**
 * Get optimal audio settings for different use cases
 */
export const getAudioSettings = (useCase: 'preview' | 'full' | 'download'): MediaProcessingOptions['audio'] => {
  switch (useCase) {
    case 'preview':
      return { quality: 'low', bitrate: 64 };
    case 'full':
      return { quality: 'medium', bitrate: 128 };
    case 'download':
      return { quality: 'high', bitrate: 320 };
    default:
      return { quality: 'medium', bitrate: 128 };
  }
};
