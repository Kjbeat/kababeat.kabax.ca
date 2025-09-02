import { Request, Response } from 'express';
import { userLicenseSettingsService } from './userLicenseSettings.service';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export class UserLicenseSettingsController {
  async getUserLicenseSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const settings = await userLicenseSettingsService.getUserLicenseSettings(userId);

      res.status(200).json({
        success: true,
        data: settings
      } as ApiResponse<typeof settings>);
    } catch (error) {
      logger.error('Get user license settings controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async updateUserLicenseSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const { licenseType } = req.params;
      const updates = req.body;

      logger.info(`Updating license settings for user ${userId}, licenseType: ${licenseType}, updates:`, updates);

      if (!licenseType) {
        res.status(400).json({
          success: false,
          error: { message: 'License type is required' }
        } as ApiResponse<null>);
        return;
      }

      const settings = await userLicenseSettingsService.updateUserLicenseSettings(userId, licenseType, updates);

      res.status(200).json({
        success: true,
        data: settings
      } as ApiResponse<typeof settings>);
    } catch (error) {
      logger.error('Update user license settings controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error',
          details: error instanceof Error ? error.stack : undefined
        }
      } as ApiResponse<null>);
    }
  }

  async createDefaultUserLicenseSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' }
        } as ApiResponse<null>);
        return;
      }

      const settings = await userLicenseSettingsService.createDefaultUserLicenseSettings(userId);

      res.status(201).json({
        success: true,
        data: settings
      } as ApiResponse<typeof settings>);
    } catch (error) {
      logger.error('Create default user license settings controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }
}

export const userLicenseSettingsController = new UserLicenseSettingsController();
