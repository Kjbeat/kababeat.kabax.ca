import { Request } from 'express';
import { ILicense } from './license.model';

export interface LicenseResponse {
  success: boolean;
  data?: ILicense | ILicense[];
  message?: string;
}

export interface LicenseQueryParams {
  isActive?: boolean;
  type?: string;
}

export interface ILicenseService {
  getAllLicenses(queryParams?: LicenseQueryParams): Promise<LicenseResponse>;
  getLicenseById(licenseId: string): Promise<LicenseResponse>;
  getLicenseByType(type: string): Promise<LicenseResponse>;
  createLicense(licenseData: Partial<ILicense>): Promise<LicenseResponse>;
  updateLicense(licenseId: string, updateData: Partial<ILicense>): Promise<LicenseResponse>;
  deleteLicense(licenseId: string): Promise<LicenseResponse>;
  getActiveLicenses(): Promise<LicenseResponse>;
  calculateLicensePrice(licenseType: string, beatBasePrice: number): Promise<number>;
}

export interface ILicenseController {
  getAllLicenses(req: Request, res: any): Promise<void>;
  getLicenseById(req: Request, res: any): Promise<void>;
  getLicenseByType(req: Request, res: any): Promise<void>;
  createLicense(req: Request, res: any): Promise<void>;
  updateLicense(req: Request, res: any): Promise<void>;
  deleteLicense(req: Request, res: any): Promise<void>;
  getActiveLicenses(req: Request, res: any): Promise<void>;
  calculateLicensePrice(req: Request, res: any): Promise<void>;
}
