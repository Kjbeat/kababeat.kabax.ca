import { Request, Response } from 'express';
import { beatService } from './beat.service';
import { IBeatController, AuthenticatedRequest } from './beat.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

export class BeatController implements IBeatController {
  async createBeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      logger.info(`Creating beat for user: ${userId}, title: ${req.body.title}`);
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const audioFile = (req.files as any)?.['audio']?.[0] as Express.Multer.File;
      if (!audioFile) {
        res.status(400).json({
          success: false,
          error: { message: 'Audio file is required' }
        } as ApiResponse<null>);
        return;
      }

      const artworkFile = (req.files as any)?.['artwork']?.[0] as Express.Multer.File;
      const stemsFile = (req.files as any)?.['stems']?.[0] as Express.Multer.File;
      logger.info(`Audio file: ${audioFile.originalname}, size: ${audioFile.size}`);
      if (artworkFile) {
        logger.info(`Artwork file: ${artworkFile.originalname}, size: ${artworkFile.size}`);
      }
      if (stemsFile) {
        logger.info(`Stems file: ${stemsFile.originalname}, size: ${stemsFile.size}`);
      }
      
      const result = await beatService.createBeat(userId, req.body, audioFile, artworkFile, stemsFile);
      logger.info(`Beat creation result:`, result);

      res.status(201).json(result);
    } catch (error) {
      logger.error('Create beat controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getBeatById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await beatService.getBeatById(id);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get beat by ID controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getBeats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('GetBeats API called with query:', req.query);
      
      const queryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        genre: req.query.genre as string,
        mood: req.query.mood as string,
        key: req.query.key as string,
        ...(req.query.minBPM && { minBPM: parseInt(req.query.minBPM as string) }),
        ...(req.query.maxBPM && { maxBPM: parseInt(req.query.maxBPM as string) }),
        ...(req.query.minPrice && { minPrice: parseInt(req.query.minPrice as string) }),
        ...(req.query.maxPrice && { maxPrice: parseInt(req.query.maxPrice as string) }),
        ...(req.query.owner && { owner: req.query.owner as string }),
        sortBy: req.query.sortBy as any,
        status: req.query.status as any
      };

      logger.info('Processed queryParams:', queryParams);
      const result = await beatService.getBeats(queryParams);
      logger.info('GetBeats result:', { success: result.success, count: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0) });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get beats controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getUserBeats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const queryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        genre: req.query.genre as string,
        mood: req.query.mood as string,
        key: req.query.key as string,
        ...(req.query.minBPM && { minBPM: parseInt(req.query.minBPM as string) }),
        ...(req.query.maxBPM && { maxBPM: parseInt(req.query.maxBPM as string) }),
        ...(req.query.minPrice && { minPrice: parseInt(req.query.minPrice as string) }),
        ...(req.query.maxPrice && { maxPrice: parseInt(req.query.maxPrice as string) }),
        sortBy: req.query.sortBy as any,
        status: req.query.status as any
      };

      const result = await beatService.getUserBeats(userId, queryParams);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get user beats controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async updateBeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await beatService.updateBeat(id, userId, req.body);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Update beat controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async updateBeatWithFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }

      const audioFile = (req.files as any)?.['audio']?.[0] as Express.Multer.File;
      const artworkFile = (req.files as any)?.['artwork']?.[0] as Express.Multer.File;
      const stemsFile = (req.files as any)?.['stems']?.[0] as Express.Multer.File;

      logger.info(`Updating beat ${id} with files for user: ${userId}`);
      if (audioFile) logger.info(`Audio file: ${audioFile.originalname}, size: ${audioFile.size}`);
      if (artworkFile) logger.info(`Artwork file: ${artworkFile.originalname}, size: ${artworkFile.size}`);
      if (stemsFile) logger.info(`Stems file: ${stemsFile.originalname}, size: ${stemsFile.size}`);

      // Parse FormData fields that are JSON strings
      const updateData = { ...req.body };
      
      // Parse JSON string fields
      if (updateData.tags && typeof updateData.tags === 'string') {
        try {
          updateData.tags = JSON.parse(updateData.tags);
        } catch (error) {
          logger.warn('Failed to parse tags JSON:', error);
        }
      }
      
      if (updateData.collaborators && typeof updateData.collaborators === 'string') {
        try {
          updateData.collaborators = JSON.parse(updateData.collaborators);
          logger.info('Parsed collaborators:', updateData.collaborators);
        } catch (error) {
          logger.warn('Failed to parse collaborators JSON:', error);
        }
      }

      // Parse numeric fields
      if (updateData.bpm && typeof updateData.bpm === 'string') {
        updateData.bpm = parseInt(updateData.bpm, 10);
      }

      // Parse boolean fields
      if (updateData.allowFreeDownload && typeof updateData.allowFreeDownload === 'string') {
        updateData.allowFreeDownload = updateData.allowFreeDownload === 'true';
      }

      logger.info('Parsed update data:', updateData);

      const result = await beatService.updateBeatWithFiles(id, userId, updateData, audioFile, artworkFile, stemsFile);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Update beat with files controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async deleteBeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await beatService.deleteBeat(id, userId);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Delete beat controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async publishBeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await beatService.publishBeat(id, userId);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Publish beat controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async unpublishBeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await beatService.unpublishBeat(id, userId);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Unpublish beat controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async scheduleBeat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      
      const { scheduledDate } = req.body;
      if (!scheduledDate) {
        res.status(400).json({
          success: false,
          error: { message: 'Scheduled date is required' }
        } as ApiResponse<null>);
        return;
      }

      const result = await beatService.scheduleBeat(id, userId, new Date(scheduledDate));

      res.status(200).json(result);
    } catch (error) {
      logger.error('Schedule beat controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getBeatStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const stats = await beatService.getBeatStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get beat stats controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async incrementPlays(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      await beatService.incrementPlays(id);

      res.status(200).json({
        success: true,
        message: 'Plays incremented'
      });
    } catch (error) {
      logger.error('Increment plays controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async incrementLikes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      await beatService.incrementLikes(id);

      res.status(200).json({
        success: true,
        message: 'Likes incremented'
      });
    } catch (error) {
      logger.error('Increment likes controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async incrementDownloads(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      await beatService.incrementDownloads(id);

      res.status(200).json({
        success: true,
        message: 'Downloads incremented'
      });
    } catch (error) {
      logger.error('Increment downloads controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async incrementSales(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }
      await beatService.incrementSales(id);

      res.status(200).json({
        success: true,
        message: 'Sales incremented'
      });
    } catch (error) {
      logger.error('Increment sales controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  // HLS streaming method removed

  async searchBeats(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q) {
        res.status(400).json({
          success: false,
          error: { message: 'Search query is required' }
        } as ApiResponse<null>);
        return;
      }

      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        genre: req.query.genre as string,
        mood: req.query.mood as string,
        key: req.query.key as string,
        ...(req.query.minBPM && { minBPM: parseInt(req.query.minBPM as string) }),
        ...(req.query.maxBPM && { maxBPM: parseInt(req.query.maxBPM as string) }),
        ...(req.query.minPrice && { minPrice: parseInt(req.query.minPrice as string) }),
        ...(req.query.maxPrice && { maxPrice: parseInt(req.query.maxPrice as string) }),
        sortBy: req.query.sortBy as any
      };

      const result = await beatService.searchBeats(q as string, filters);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Search beats controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getArtworkUrl(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }

      const result = await beatService.getArtworkUrl(id);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get artwork URL controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getAudioUrl(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'Beat ID is required' }
        } as ApiResponse<null>);
        return;
      }

      const result = await beatService.getAudioUrl(id);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get audio URL controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  // HLS processing method removed
}

export const beatController = new BeatController();