import { Response, NextFunction } from 'express';
import { BeatService } from './beat.service';
import { IBeatController, BeatRequest } from './beat.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

export class BeatController implements IBeatController {
  private beatService: BeatService;

  constructor() {
    this.beatService = new BeatService();
  }

  createBeat = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const producerId = req.user?.userId;
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      const beat = await this.beatService.createBeat(producerId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: beat,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBeatById = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const beat = await this.beatService.getBeatByIdPublic(id);
      
      const response: ApiResponse = {
        success: true,
        data: beat,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateBeat = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const producerId = req.user?.userId;
      
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      const beat = await this.beatService.updateBeat(id, producerId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: beat,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteBeat = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const producerId = req.user?.userId;
      
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      await this.beatService.deleteBeat(id, producerId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Beat deleted successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getMyBeats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const producerId = req.user?.userId;
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: req.query.sort as string || '-createdAt',
        search: req.query.search as string,
        filters: {
          ...(req.query.genre && { genre: req.query.genre as string }),
          ...(req.query.bpm && { bpm: parseInt(req.query.bpm as string) }),
          ...(req.query.key && { musicalKey: req.query.key as string }),
          ...(req.query.priceMin && { priceMin: parseFloat(req.query.priceMin as string) }),
          ...(req.query.priceMax && { priceMax: parseFloat(req.query.priceMax as string) }),
          ...(req.query.tags && { tags: (req.query.tags as string).split(',') }),
        },
        ...(req.query.published !== undefined && { isPublished: req.query.published === 'true' }),
        ...(req.query.exclusive !== undefined && { isExclusive: req.query.exclusive === 'true' }),
      };

      const result = await this.beatService.getBeatsByProducer(producerId, options);
      
      const response: ApiResponse = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  searchBeats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: req.query.sort as string || '-createdAt',
        search: req.query.q as string,
        filters: {
          ...(req.query.genre && { genre: req.query.genre as string }),
          ...(req.query.bpm && { bpm: parseInt(req.query.bpm as string) }),
          ...(req.query.key && { musicalKey: req.query.key as string }),
          ...(req.query.priceMin && { priceMin: parseFloat(req.query.priceMin as string) }),
          ...(req.query.priceMax && { priceMax: parseFloat(req.query.priceMax as string) }),
          ...(req.query.tags && { tags: (req.query.tags as string).split(',') }),
        },
        producerId: req.query.producer as string,
        isPublished: req.query.published !== 'false', // Default to true
        ...(req.query.exclusive !== undefined && { isExclusive: req.query.exclusive === 'true' }),
      };

      const result = await this.beatService.searchBeats(options);
      
      const response: ApiResponse = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getFeaturedBeats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const beats = await this.beatService.getFeaturedBeats(limit);
      
      const response: ApiResponse = {
        success: true,
        data: beats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTrendingBeats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const beats = await this.beatService.getTrendingBeats(limit);
      
      const response: ApiResponse = {
        success: true,
        data: beats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getNewestBeats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const beats = await this.beatService.getNewestBeats(limit);
      
      const response: ApiResponse = {
        success: true,
        data: beats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRelatedBeats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const beats = await this.beatService.getRelatedBeats(id, limit);
      
      const response: ApiResponse = {
        success: true,
        data: beats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  incrementPlays = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      await this.beatService.incrementPlays(id);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Play count incremented' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  incrementLikes = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      await this.beatService.incrementLikes(id);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Like count incremented' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  incrementDownloads = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      await this.beatService.incrementDownloads(id);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Download count incremented' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  incrementShares = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      await this.beatService.incrementShares(id);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Share count incremented' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  publishBeat = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const producerId = req.user?.userId;
      
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      const beat = await this.beatService.publishBeat(id, producerId);
      
      const response: ApiResponse = {
        success: true,
        data: beat,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  unpublishBeat = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const producerId = req.user?.userId;
      
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      const beat = await this.beatService.unpublishBeat(id, producerId);
      
      const response: ApiResponse = {
        success: true,
        data: beat,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBeatStats = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const producerId = req.user?.userId; // Optional - if provided, get stats for that producer
      const stats = await this.beatService.getBeatStats(producerId);
      
      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getBeatAnalytics = async (req: BeatRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Beat ID is required', 400);
      }
      const producerId = req.user?.userId;
      
      if (!producerId) {
        throw new CustomError('User not authenticated', 401);
      }

      const analytics = await this.beatService.getBeatAnalytics(id, producerId);
      
      const response: ApiResponse = {
        success: true,
        data: analytics,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
