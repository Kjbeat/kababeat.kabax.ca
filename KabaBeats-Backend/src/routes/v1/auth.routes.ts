import { Router } from 'express';
import { AuthController } from '@/modules/auth';
import { authenticate, optionalAuth } from '@/utils/auth';
import { validate, validateParams, commonSchemas } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const authController = new AuthController();

// Validation schemas
const registerSchema = Joi.object({
  email: commonSchemas.email,
  username: commonSchemas.username,
  password: commonSchemas.password,
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  country: Joi.string().max(50).optional(),
  themePreferences: Joi.object({
    mode: Joi.string().valid('light', 'dark', 'system').optional(),
    customTheme: Joi.object({
      primary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      radius: Joi.number().min(0.125).max(2).optional(),
    }).optional(),
  }).optional(),
});

const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().required(),
  country: Joi.string().max(50).optional(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: commonSchemas.email,
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: commonSchemas.password,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: commonSchemas.password,
});

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).optional(),
  email: Joi.string().email().optional(),
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  bio: Joi.string().max(500).allow('').optional(),
  country: Joi.string().max(50).optional(),
  avatar: Joi.string().uri().allow('').optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().allow('').optional(),
    instagram: Joi.string().uri().allow('').optional(),
    twitter: Joi.string().uri().allow('').optional(),
    youtube: Joi.string().uri().allow('').optional(),
  }).optional(),
});

const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
});

const themePreferencesSchema = Joi.object({
  themePreferences: Joi.object({
    mode: Joi.string().valid('light', 'dark', 'system').required(),
    customTheme: Joi.object({
      primary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      radius: Joi.number().min(0.125).max(2).optional(),
    }).optional(),
  }).required(),
});

const verifyOTPSchema = Joi.object({
  email: commonSchemas.email,
  otp: Joi.string().length(7).pattern(/^[0-9]{7}$/).required(),
});

const resendOTPSchema = Joi.object({
  email: commonSchemas.email,
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.get('/google/callback', authController.googleCallback);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyEmailOTP);
router.post('/resend-otp', validate(resendOTPSchema), authController.resendVerificationOTP);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', validate(refreshTokenSchema), authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authController.getProfile);
router.put('/profile', validate(updateProfileSchema), authController.updateProfile);
router.delete('/account', validate(deleteAccountSchema), authController.deleteAccount);
router.put('/theme-preferences', validate(themePreferencesSchema), authController.updateThemePreferences);
router.get('/theme-preferences', authController.getThemePreferences);

export default router;
