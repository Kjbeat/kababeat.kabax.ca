import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}
import { IMediaController, UploadRequest } from './media.interface';
import { MediaService } from './media.service';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';
import { getCacheHeaders } from '@/config/cdn';

export class MediaController implements IMediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Generate upload URL for media files
   */
  async generateUploadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { fileType, originalName, contentType, size, beatId } = req.body;

      // Validate required fields
      if (!fileType || !originalName || !contentType || !size) {
        throw new CustomError('Missing required fields', 400);
      }

      // Validate file type
      if (!['audio', 'image', 'profile', 'artwork'].includes(fileType)) {
        throw new CustomError('Invalid file type', 400);
      }

      // Validate beatId for beat-related uploads
      if (['audio', 'artwork'].includes(fileType) && !beatId) {
        throw new CustomError('Beat ID required for audio and artwork uploads', 400);
      }

      const uploadRequest: UploadRequest = {
        userId,
        fileType,
        originalName,
        contentType,
        size: parseInt(size),
        beatId,
      };

      const result = await this.mediaService.generateUploadUrl(uploadRequest);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Generate upload URL error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to generate upload URL',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Confirm file upload and process media
   */
  async confirmUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { key, fileType, beatId } = req.body;

      // Validate required fields
      if (!key || !fileType) {
        throw new CustomError('Missing required fields', 400);
      }

      // Validate file type
      if (!['audio', 'image', 'profile', 'artwork'].includes(fileType)) {
        throw new CustomError('Invalid file type', 400);
      }

      const mediaFile = await this.mediaService.confirmUpload(userId, key, fileType, beatId);

      const response: ApiResponse<typeof mediaFile> = {
        success: true,
        data: mediaFile,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Confirm upload error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to confirm upload',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Get download URL for a media file
   */
  async getDownloadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { fileId } = req.params;
      const { expiresIn = 3600 } = req.query;

      if (!fileId) {
        throw new CustomError('File ID required', 400);
      }

      const downloadUrl = await this.mediaService.getDownloadUrl(
        userId,
        fileId,
        parseInt(expiresIn as string)
      );

      const response: ApiResponse<{ downloadUrl: string }> = {
        success: true,
        data: { downloadUrl },
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get download URL error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to get download URL',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Delete a media file
   */
  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { fileId } = req.params;

      if (!fileId) {
        throw new CustomError('File ID required', 400);
      }

      await this.mediaService.deleteFile(userId, fileId);

      const response: ApiResponse<null> = {
        success: true,
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Delete file error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to delete file',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Get user's media files
   */
  async getUserFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { fileType, beatId } = req.query;

      const files = await this.mediaService.getUserFiles(
        userId,
        fileType as string,
        beatId as string
      );

      const response: ApiResponse<typeof files> = {
        success: true,
        data: files,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get user files error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to get user files',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { fileId } = req.params;
      const { title, description, tags, isPublic } = req.body;

      if (!fileId) {
        throw new CustomError('File ID required', 400);
      }

      const mediaFile = await this.mediaService.updateFileMetadata(userId, fileId, {
        title,
        description,
        tags,
        isPublic,
      });

      const response: ApiResponse<typeof mediaFile> = {
        success: true,
        data: mediaFile,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update file metadata error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to update file metadata',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Initialize chunked upload
   */
  async initializeChunkedUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { fileName, fileSize, contentType, beatId, fileType } = req.body;

      // Validate required fields
      if (!fileName || !fileSize || !contentType || !fileType) {
        throw new CustomError('Missing required fields', 400);
      }

      const session = await this.mediaService.initializeChunkedUpload({
        userId,
        fileName,
        fileSize: parseInt(fileSize),
        contentType,
        beatId,
        fileType,
      });

      const response: ApiResponse<typeof session> = {
        success: true,
        data: session,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Initialize chunked upload error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to initialize chunked upload',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Generate chunk upload URL
   */
  async generateChunkUploadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { sessionId, chunkNumber, chunkSize, totalChunks, fileName, fileSize, contentType, beatId, fileType } = req.body;

      // Validate required fields
      if (!sessionId || chunkNumber === undefined || !chunkSize || !totalChunks || !fileName || !fileSize || !contentType || !fileType) {
        throw new CustomError('Missing required fields', 400);
      }

      const result = await this.mediaService.generateChunkUploadUrl({
        sessionId,
        chunkNumber: parseInt(chunkNumber),
        chunkSize: parseInt(chunkSize),
        totalChunks: parseInt(totalChunks),
        fileName,
        fileSize: parseInt(fileSize),
        contentType,
        userId,
        beatId,
        fileType,
      });

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Generate chunk upload URL error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to generate chunk upload URL',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Mark chunk as uploaded
   */
  async markChunkUploaded(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { sessionId, chunkNumber } = req.body;

      if (!sessionId || chunkNumber === undefined) {
        throw new CustomError('Missing required fields', 400);
      }

      await this.mediaService.markChunkUploaded(sessionId, parseInt(chunkNumber));

      const response: ApiResponse<null> = {
        success: true,
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Mark chunk uploaded error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to mark chunk as uploaded',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Get upload progress
   */
  async getUploadProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { sessionId } = req.params;

      if (!sessionId) {
        throw new CustomError('Session ID required', 400);
      }

      const progress = await this.mediaService.getUploadProgress(sessionId);

      const response: ApiResponse<typeof progress> = {
        success: true,
        data: progress,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get upload progress error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to get upload progress',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Complete chunked upload
   */
  async completeChunkedUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { sessionId, checksum } = req.body;

      if (!sessionId || !checksum) {
        throw new CustomError('Missing required fields', 400);
      }

      const result = await this.mediaService.completeChunkedUpload({
        sessionId,
        userId,
        checksum,
      });

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Complete chunked upload error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to complete chunked upload',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  /**
   * Abort chunked upload
   */
  async abortChunkedUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { sessionId } = req.params;

      if (!sessionId) {
        throw new CustomError('Session ID required', 400);
      }

      await this.mediaService.abortChunkedUpload(sessionId);

      const response: ApiResponse<null> = {
        success: true,
        data: null,
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Abort chunked upload error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: {
          message: error instanceof CustomError ? error.message : 'Failed to abort chunked upload',
        },
      };
      res.status(error instanceof CustomError ? error.statusCode : 500).json(response);
    }
  }

  // HLS methods removed

}