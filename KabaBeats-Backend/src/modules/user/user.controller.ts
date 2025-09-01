import { Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { IUserController, UserRequest } from './user.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

export class UserController implements IUserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const user = await this.userService.getProfile(userId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await this.userService.updateProfile(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  followUser = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!targetUserId) {
        throw new CustomError('Target user ID is required', 400);
      }

      await this.userService.followUser(userId, targetUserId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'User followed successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { targetUserId } = req.params;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!targetUserId) {
        throw new CustomError('Target user ID is required', 400);
      }

      await this.userService.unfollowUser(userId, targetUserId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'User unfollowed successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getFollowers = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const result = await this.userService.getFollowers(userId, page, limit);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getFollowing = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const result = await this.userService.getFollowing(userId, page, limit);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  searchUsers = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query || typeof query !== 'string') {
        throw new CustomError('Search query is required', 400);
      }

      const result = await this.userService.searchUsers(query, page, limit);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRecommendedUsers = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const users = await this.userService.getRecommendedUsers(userId, limit);
      
      const response: ApiResponse = {
        success: true,
        data: users,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTopProducers = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const producers = await this.userService.getTopProducers(limit);
      
      const response: ApiResponse = {
        success: true,
        data: producers,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRecentUsers = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const users = await this.userService.getRecentUsers(limit);
      
      const response: ApiResponse = {
        success: true,
        data: users,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
