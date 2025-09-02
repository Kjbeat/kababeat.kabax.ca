import { Router } from 'express';
import { userLicenseSettingsController } from '@/modules/user/userLicenseSettings.controller';
import { authMiddleware } from '@/middleware/auth';
import { validateRequest } from '@/utils/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const updateLicenseSettingsSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  price: Joi.number().optional().min(0).max(10000),
  territory: Joi.string().optional().valid('worldwide', 'us-only', 'north-america', 'europe', 'custom'),
  streamLimit: Joi.number().optional().min(-1),
  saleLimit: Joi.number().optional().min(-1),
  distribution: Joi.boolean().optional(),
  videos: Joi.boolean().optional(),
  radio: Joi.boolean().optional(),
  live: Joi.boolean().optional()
}).unknown(true); // Allow additional fields

// Routes
router.get(
  '/',
  authMiddleware,
  userLicenseSettingsController.getUserLicenseSettings
);

router.put(
  '/:licenseType',
  authMiddleware,
  validateRequest(updateLicenseSettingsSchema),
  userLicenseSettingsController.updateUserLicenseSettings
);

router.post(
  '/default',
  authMiddleware,
  userLicenseSettingsController.createDefaultUserLicenseSettings
);

export default router;
