import { Router } from 'express';
import { licenseController } from '@/modules/license/license.controller';
import { validateRequest } from '@/utils/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createLicenseSchema = Joi.object({
  name: Joi.string().required().trim().max(50),
  type: Joi.string().required().valid('FREE', 'MP3', 'WAV', 'STEMS', 'EXCLUSIVE'),
  description: Joi.string().required().trim().max(500),
  price: Joi.number().required().min(0).max(10000),
  features: Joi.array().items(Joi.string().trim().max(200)).optional(),
  usageRights: Joi.string().required().trim().max(1000),
  restrictions: Joi.array().items(Joi.string().trim().max(200)).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().optional().min(0)
});

const updateLicenseSchema = Joi.object({
  name: Joi.string().optional().trim().max(50),
  type: Joi.string().optional().valid('FREE', 'MP3', 'WAV', 'STEMS', 'EXCLUSIVE'),
  description: Joi.string().optional().trim().max(500),
  price: Joi.number().optional().min(0).max(10000),
  features: Joi.array().items(Joi.string().trim().max(200)).optional(),
  usageRights: Joi.string().optional().trim().max(1000),
  restrictions: Joi.array().items(Joi.string().trim().max(200)).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().optional().min(0)
});

const licenseQuerySchema = Joi.object({
  isActive: Joi.boolean().optional(),
  type: Joi.string().optional()
});

const calculatePriceSchema = Joi.object({
  licenseType: Joi.string().required(),
  beatBasePrice: Joi.number().required().min(0)
});

// Routes
router.get(
  '/',
  validateRequest(licenseQuerySchema),
  licenseController.getAllLicenses
);

router.get(
  '/active',
  licenseController.getActiveLicenses
);

router.get(
  '/calculate-price',
  validateRequest(calculatePriceSchema),
  licenseController.calculateLicensePrice
);

router.get(
  '/:id',
  licenseController.getLicenseById
);

router.get(
  '/type/:type',
  licenseController.getLicenseByType
);

router.post(
  '/',
  validateRequest(createLicenseSchema),
  licenseController.createLicense
);

router.put(
  '/:id',
  validateRequest(updateLicenseSchema),
  licenseController.updateLicense
);

router.delete(
  '/:id',
  licenseController.deleteLicense
);

export default router;
