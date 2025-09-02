import { UserLicenseSettings, IUserLicenseSettings } from './userLicenseSettings.model';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';

export interface IUserLicenseSettingsService {
  getUserLicenseSettings(userId: string): Promise<IUserLicenseSettings>;
  updateUserLicenseSettings(userId: string, licenseType: string, updates: any): Promise<IUserLicenseSettings>;
  createDefaultUserLicenseSettings(userId: string): Promise<IUserLicenseSettings>;
}

export class UserLicenseSettingsService implements IUserLicenseSettingsService {
  async getUserLicenseSettings(userId: string): Promise<IUserLicenseSettings> {
    try {
      const settings = await UserLicenseSettings.getOrCreateUserSettings(userId);
      logger.info(`Retrieved license settings for user: ${userId}`);
      return settings;
    } catch (error) {
      logger.error('Error getting user license settings:', error);
      throw error;
    }
  }

  async updateUserLicenseSettings(userId: string, licenseType: string, updates: any): Promise<IUserLicenseSettings> {
    try {
      const settings = await UserLicenseSettings.getOrCreateUserSettings(userId);
      
      // Validate license type
      const validLicenseTypes = ['mp3', 'wav', 'trackout', 'unlimited', 'exclusive'];
      if (!validLicenseTypes.includes(licenseType)) {
        throw new CustomError('Invalid license type', 400);
      }

      // Update the specific license type
      await settings.updateLicenseType(licenseType, updates);
      
      logger.info(`Updated ${licenseType} license settings for user: ${userId}`);
      return settings;
    } catch (error) {
      logger.error('Error updating user license settings:', error);
      throw error;
    }
  }

  async createDefaultUserLicenseSettings(userId: string): Promise<IUserLicenseSettings> {
    try {
      const settings = new UserLicenseSettings({ userId });
      await settings.save();
      
      logger.info(`Created default license settings for user: ${userId}`);
      return settings;
    } catch (error) {
      logger.error('Error creating default user license settings:', error);
      throw error;
    }
  }
}

export const userLicenseSettingsService = new UserLicenseSettingsService();
