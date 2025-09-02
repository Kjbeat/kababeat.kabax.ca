import { Request, Response } from 'express';
import { licenseService } from './license.service';
import { ILicenseController } from './license.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

export class LicenseController implements ILicenseController {
  async getAllLicenses(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = {
        ...(req.query.isActive && { isActive: req.query.isActive === 'true' }),
        ...(req.query.type && { type: req.query.type as string })
      };

      const result = await licenseService.getAllLicenses(queryParams);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get all licenses controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getLicenseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'License ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await licenseService.getLicenseById(id);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get license by ID controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getLicenseByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      if (!type) {
        res.status(400).json({
          success: false,
          error: { message: 'License type is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await licenseService.getLicenseByType(type);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get license by type controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async createLicense(req: Request, res: Response): Promise<void> {
    try {
      const result = await licenseService.createLicense(req.body);

      res.status(201).json(result);
    } catch (error) {
      logger.error('Create license controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async updateLicense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'License ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await licenseService.updateLicense(id, req.body);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Update license controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async deleteLicense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { message: 'License ID is required' }
        } as ApiResponse<null>);
        return;
      }
      const result = await licenseService.deleteLicense(id);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Delete license controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async getActiveLicenses(req: Request, res: Response): Promise<void> {
    try {
      const result = await licenseService.getActiveLicenses();

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get active licenses controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }

  async calculateLicensePrice(req: Request, res: Response): Promise<void> {
    try {
      const { licenseType, beatBasePrice } = req.query;
      
      if (!licenseType || !beatBasePrice) {
        res.status(400).json({
          success: false,
          error: { message: 'License type and beat base price are required' }
        } as ApiResponse<null>);
        return;
      }

      const price = await licenseService.calculateLicensePrice(
        licenseType as string, 
        parseFloat(beatBasePrice as string)
      );

      res.status(200).json({
        success: true,
        data: { price }
      });
    } catch (error) {
      logger.error('Calculate license price controller error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' }
      } as ApiResponse<null>);
    }
  }
}

export const licenseController = new LicenseController();
