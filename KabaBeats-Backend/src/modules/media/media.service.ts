import { IMediaService, UploadRequest, UploadResponse, ProcessingResult } from './media.interface';
import { MediaFile, IMediaFile } from './media.model';
import { generateUploadUrl, generateDownloadUrl, deleteStorageFile, STORAGE_PATHS } from '@/utils/r2Storage';
import { processMediaFile, validateAudioFile, validateImageFile, getImageDimensions, getAudioSettings } from '@/utils/mediaProcessor';
import { 
  initializeChunkedUpload, 
  generateChunkUploadUrl, 
  markChunkUploaded, 
  isUploadComplete, 
  getUploadProgress, 
  completeChunkedUpload, 
  abortChunkedUpload,
  ChunkedUploadSession,
  ChunkUploadRequest 
} from '@/utils/chunkedUpload';
import { processAudioFile, extractAudioMetadata, ProcessingOptions } from '@/utils/audioProcessor';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { User } from '../auth/auth.model';
import { Beat } from '../beat/beat.model';

export class MediaService implements IMediaService {
  /**
   * Generate upload URL for media files
   */
  async generateUploadUrl(request: UploadRequest): Promise<UploadResponse> {
    try {
      // Validate user exists
      const user = await User.findById(request.userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Validate beat exists for beat-related uploads
      if (request.beatId) {
        const beat = await Beat.findOne({ _id: request.beatId, owner: request.userId });
        if (!beat) {
          throw new CustomError('Beat not found or access denied', 404);
        }
      }

      // Generate upload URL
      const result = await generateUploadUrl(request);
      
      logger.info(`Generated upload URL for user ${request.userId}: ${result.key}`);
      
      return result;
    } catch (error) {
      logger.error('Error generating upload URL:', error);
      throw error;
    }
  }

  /**
   * Confirm file upload and process media
   */
  async confirmUpload(
    userId: string,
    key: string,
    fileType: 'audio' | 'image' | 'profile' | 'artwork',
    beatId?: string
  ): Promise<IMediaFile> {
    try {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Validate beat exists for beat-related uploads
      if (beatId) {
        const beat = await Beat.findOne({ _id: beatId, userId });
        if (!beat) {
          throw new CustomError('Beat not found or access denied', 404);
        }
      }

      // Process the uploaded file
      const processingResult = await this.processUploadedFile(key, fileType);
      
      // Create media file record
      const mediaFile = new MediaFile({
        key: processingResult.originalKey,
        processedKey: processingResult.processedKey,
        thumbnailKey: processingResult.thumbnailKey,
        userId,
        beatId,
        fileType,
        metadata: processingResult.metadata,
        status: 'processed',
        uploadedAt: new Date(),
      });

      await mediaFile.save();
      
      logger.info(`Confirmed upload for user ${userId}: ${key}`);
      
      return mediaFile;
    } catch (error) {
      logger.error('Error confirming upload:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a media file
   */
  async getDownloadUrl(userId: string, fileId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const mediaFile = await MediaFile.findOne({ _id: fileId, userId });
      if (!mediaFile) {
        throw new CustomError('File not found or access denied', 404);
      }

      const downloadUrl = await generateDownloadUrl(mediaFile.key, expiresIn);
      
      logger.info(`Generated download URL for user ${userId}: ${mediaFile.key}`);
      
      return downloadUrl;
    } catch (error) {
      logger.error('Error getting download URL:', error);
      throw error;
    }
  }

  /**
   * Delete a media file
   */
  async deleteFile(userId: string, fileId: string): Promise<void> {
    try {
      const mediaFile = await MediaFile.findOne({ _id: fileId, userId });
      if (!mediaFile) {
        throw new CustomError('File not found or access denied', 404);
      }

      // Delete from storage
      await deleteStorageFile(mediaFile.key);
      if (mediaFile.processedKey) {
        await deleteStorageFile(mediaFile.processedKey);
      }
      if (mediaFile.thumbnailKey) {
        await deleteStorageFile(mediaFile.thumbnailKey);
      }

      // Delete from database
      await MediaFile.findByIdAndDelete(fileId);
      
      logger.info(`Deleted file for user ${userId}: ${mediaFile.key}`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get user's media files
   */
  async getUserFiles(userId: string, fileType?: string, beatId?: string): Promise<IMediaFile[]> {
    try {
      const query: any = { userId };
      
      if (fileType) {
        query.fileType = fileType;
      }
      
      if (beatId) {
        query.beatId = beatId;
      }

      const files = await MediaFile.find(query).sort({ uploadedAt: -1 });
      
      logger.info(`Retrieved ${files.length} files for user ${userId}`);
      
      return files;
    } catch (error) {
      logger.error('Error getting user files:', error);
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    userId: string,
    fileId: string,
    metadata: Partial<IMediaFile>
  ): Promise<IMediaFile> {
    try {
      const mediaFile = await MediaFile.findOne({ _id: fileId, userId });
      if (!mediaFile) {
        throw new CustomError('File not found or access denied', 404);
      }

      // Update allowed fields
      const allowedFields = ['title', 'description', 'tags', 'isPublic'];
      allowedFields.forEach(field => {
        if (metadata[field as keyof IMediaFile] !== undefined) {
          (mediaFile as any)[field] = metadata[field as keyof IMediaFile];
        }
      });

      await mediaFile.save();
      
      logger.info(`Updated metadata for file ${fileId}`);
      
      return mediaFile;
    } catch (error) {
      logger.error('Error updating file metadata:', error);
      throw error;
    }
  }

  /**
   * Process uploaded file based on type
   */
  private async processUploadedFile(
    key: string,
    fileType: string
  ): Promise<ProcessingResult> {
    try {
      // Determine content type from key
      const contentType = this.getContentTypeFromKey(key);
      
      // Set processing options based on file type
      const options = this.getProcessingOptions(fileType);
      
      // Process the file
      const result = await processMediaFile(key, contentType, options as any);
      
      logger.info(`Processed file: ${key}`);
      
      return result;
    } catch (error) {
      logger.error('Error processing uploaded file:', error);
      throw error;
    }
  }

  /**
   * Get content type from file key
   */
  private getContentTypeFromKey(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    
    const contentTypes: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'm4a': 'audio/m4a',
      'flac': 'audio/flac',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
    };
    
    return contentTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Get processing options based on file type
   */
  private getProcessingOptions(fileType: string) {
    switch (fileType) {
      case 'audio':
        return {
          audio: getAudioSettings('full'),
        };
      case 'artwork':
        return {
          image: {
            quality: 90,
            format: 'jpeg',
            ...getImageDimensions('artwork'),
            generateThumbnail: true,
          },
        };
      case 'profile':
        return {
          image: {
            quality: 85,
            format: 'jpeg',
            ...getImageDimensions('profile'),
            generateThumbnail: true,
          },
        };
      default:
        return {};
    }
  }

  /**
   * Initialize chunked upload for large files
   */
  async initializeChunkedUpload(request: {
    userId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    beatId?: string;
    fileType: 'audio' | 'image' | 'profile' | 'artwork';
  }): Promise<ChunkedUploadSession> {
    try {
      // Validate user exists
      const user = await User.findById(request.userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Validate beat exists for beat-related uploads
      if (request.beatId) {
        const beat = await Beat.findOne({ _id: request.beatId, userId: request.userId });
        if (!beat) {
          throw new CustomError('Beat not found or access denied', 404);
        }
      }

      const session = await initializeChunkedUpload(request);
      
      logger.info(`Initialized chunked upload session: ${session.sessionId}`);
      
      return session;
    } catch (error) {
      logger.error('Error initializing chunked upload:', error);
      throw error;
    }
  }

  /**
   * Generate upload URL for a specific chunk
   */
  async generateChunkUploadUrl(request: ChunkUploadRequest): Promise<{
    uploadUrl: string;
    chunkKey: string;
    expiresIn: number;
  }> {
    try {
      const result = await generateChunkUploadUrl(request);
      
      logger.info(`Generated chunk upload URL for session: ${request.sessionId}, chunk: ${request.chunkNumber}`);
      
      return result;
    } catch (error) {
      logger.error('Error generating chunk upload URL:', error);
      throw error;
    }
  }

  /**
   * Mark chunk as uploaded
   */
  async markChunkUploaded(sessionId: string, chunkNumber: number): Promise<void> {
    try {
      await markChunkUploaded(sessionId, chunkNumber);
      
      logger.info(`Marked chunk ${chunkNumber} as uploaded for session: ${sessionId}`);
    } catch (error) {
      logger.error('Error marking chunk as uploaded:', error);
      throw error;
    }
  }

  /**
   * Get upload progress
   */
  async getUploadProgress(sessionId: string): Promise<{
    uploaded: number;
    total: number;
    percentage: number;
  }> {
    try {
      const progress = await getUploadProgress(sessionId);
      
      logger.info(`Upload progress for session ${sessionId}: ${progress.percentage}%`);
      
      return progress;
    } catch (error) {
      logger.error('Error getting upload progress:', error);
      throw error;
    }
  }

  /**
   * Complete chunked upload
   */
  async completeChunkedUpload(request: {
    sessionId: string;
    userId: string;
    checksum: string;
  }): Promise<{
    finalKey: string;
    downloadUrl: string;
    mediaFile: IMediaFile;
  }> {
    try {
      // Complete the upload
      const result = await completeChunkedUpload(request);
      
      // Process the audio file if it's an audio upload
      const session = this.getUploadSession(request.sessionId);
      if (session && session.fileType === 'audio') {
        await this.processAudioFile(result.finalKey, session);
      }
      
      // Create media file record
      const mediaFile = new MediaFile({
        key: result.finalKey,
        userId: request.userId,
        beatId: session?.beatId,
        fileType: session?.fileType || 'audio',
        metadata: {
          format: 'audio/mpeg',
          size: session?.fileSize || 0,
        },
        status: 'processed',
        uploadedAt: new Date(),
      });

      await mediaFile.save();
      
      logger.info(`Completed chunked upload: ${result.finalKey}`);
      
      return {
        finalKey: result.finalKey,
        downloadUrl: result.downloadUrl,
        mediaFile,
      };
    } catch (error) {
      logger.error('Error completing chunked upload:', error);
      throw error;
    }
  }

  /**
   * Abort chunked upload
   */
  async abortChunkedUpload(sessionId: string): Promise<void> {
    try {
      await abortChunkedUpload(sessionId);
      
      logger.info(`Aborted chunked upload session: ${sessionId}`);
    } catch (error) {
      logger.error('Error aborting chunked upload:', error);
      throw error;
    }
  }

  // HLS methods removed

  /**
   * Process audio file for streaming
   */
  private async processAudioFile(fileKey: string, session: ChunkedUploadSession): Promise<void> {
    try {
      const processingOptions: ProcessingOptions = {
        generatePreview: true,
        previewDuration: 30,
        generateHLS: false,
        outputFormats: ['mp3'],
        quality: 'medium',
      };

      // In a real implementation, you would:
      // 1. Download the file from R2
      // 2. Process it with FFmpeg
      // 3. Upload processed versions back to R2
      
      logger.info(`Processing audio file for streaming: ${fileKey}`);
    } catch (error) {
      logger.error('Error processing audio file:', error);
      throw error;
    }
  }

  /**
   * Get upload session (helper method)
   */
  private getUploadSession(sessionId: string): ChunkedUploadSession | null {
    // In a real implementation, you would retrieve this from Redis or database
    return null;
  }

  /**
   * Clean up orphaned files
   */
  async cleanupOrphanedFiles(): Promise<void> {
    try {
      // Find files that are not associated with any beat or user
      const orphanedFiles = await MediaFile.find({
        $or: [
          { userId: { $exists: false } },
          { beatId: { $exists: true, $ne: null }, beat: { $exists: false } },
        ],
        uploadedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Older than 24 hours
      });

      for (const file of orphanedFiles) {
        await this.deleteFile(file.userId, (file._id as any).toString());
      }

      logger.info(`Cleaned up ${orphanedFiles.length} orphaned files`);
    } catch (error) {
      logger.error('Error cleaning up orphaned files:', error);
      throw error;
    }
  }
}