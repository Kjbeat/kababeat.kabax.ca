import { License } from './license.model';
import { ILicenseService, LicenseResponse, LicenseQueryParams } from './license.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import mongoose from 'mongoose';

export class LicenseService implements ILicenseService {
  async getAllLicenses(queryParams?: LicenseQueryParams): Promise<LicenseResponse> {
    try {
      const query: any = {};
      
      if (queryParams?.isActive !== undefined) {
        query.isActive = queryParams.isActive;
      }
      
      if (queryParams?.type) {
        query.type = queryParams.type;
      }

      const licenses = await License.find(query).sort({ sortOrder: 1 });

      return {
        success: true,
        data: licenses
      };
    } catch (error) {
      logger.error('Error getting all licenses:', error);
      throw error;
    }
  }

  async getLicenseById(licenseId: string): Promise<LicenseResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(licenseId)) {
        throw new CustomError('Invalid license ID', 400);
      }

      const license = await License.findById(licenseId);
      if (!license) {
        throw new CustomError('License not found', 404);
      }

      return {
        success: true,
        data: license
      };
    } catch (error) {
      logger.error('Error getting license by ID:', error);
      throw error;
    }
  }

  async getLicenseByType(type: string): Promise<LicenseResponse> {
    try {
      const license = await License.findOne({ type, isActive: true });
      if (!license) {
        throw new CustomError('License not found', 404);
      }

      return {
        success: true,
        data: license
      };
    } catch (error) {
      logger.error('Error getting license by type:', error);
      throw error;
    }
  }

  async createLicense(licenseData: Partial<any>): Promise<LicenseResponse> {
    try {
      // Check if license type already exists
      if (licenseData.type) {
        const existingLicense = await License.findOne({ type: licenseData.type });
        if (existingLicense) {
          throw new CustomError('License type already exists', 400);
        }
      }

      const license = new License(licenseData);
      await license.save();

      logger.info(`License created: ${license._id}`);

      return {
        success: true,
        data: license,
        message: 'License created successfully'
      };
    } catch (error) {
      logger.error('Error creating license:', error);
      throw error;
    }
  }

  async updateLicense(licenseId: string, updateData: Partial<any>): Promise<LicenseResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(licenseId)) {
        throw new CustomError('Invalid license ID', 400);
      }

      const license = await License.findById(licenseId);
      if (!license) {
        throw new CustomError('License not found', 404);
      }

      // Check if license type already exists (if type is being updated)
      if (updateData.type && updateData.type !== license.type) {
        const existingLicense = await License.findOne({ 
          type: updateData.type,
          _id: { $ne: licenseId }
        });
        if (existingLicense) {
          throw new CustomError('License type already exists', 400);
        }
      }

      Object.assign(license, updateData);
      await license.save();

      logger.info(`License updated: ${licenseId}`);

      return {
        success: true,
        data: license,
        message: 'License updated successfully'
      };
    } catch (error) {
      logger.error('Error updating license:', error);
      throw error;
    }
  }

  async deleteLicense(licenseId: string): Promise<LicenseResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(licenseId)) {
        throw new CustomError('Invalid license ID', 400);
      }

      const license = await License.findById(licenseId);
      if (!license) {
        throw new CustomError('License not found', 404);
      }

      await License.findByIdAndDelete(licenseId);

      logger.info(`License deleted: ${licenseId}`);

      return {
        success: true,
        message: 'License deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting license:', error);
      throw error;
    }
  }

  async getActiveLicenses(): Promise<LicenseResponse> {
    try {
      const licenses = await License.find({ isActive: true }).sort({ sortOrder: 1 });

      return {
        success: true,
        data: licenses
      };
    } catch (error) {
      logger.error('Error getting active licenses:', error);
      throw error;
    }
  }

  async calculateLicensePrice(licenseType: string, beatBasePrice: number): Promise<number> {
    try {
      const license = await License.findOne({ type: licenseType, isActive: true });
      if (!license) {
        throw new CustomError('License not found', 404);
      }

      return license.calculatePrice(beatBasePrice);
    } catch (error) {
      logger.error('Error calculating license price:', error);
      throw error;
    }
  }
}

export const licenseService = new LicenseService();
