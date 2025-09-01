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
});

const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().required(),
});

const googleAuthSchema = Joi.object({
  email: commonSchemas.email,
  username: commonSchemas.username,
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  avatar: Joi.string().uri().optional(),
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

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const resendVerificationSchema = Joi.object({
  email: commonSchemas.email,
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  bio: Joi.string().max(500).optional(),
  country: Joi.string().max(50).optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().optional(),
    instagram: Joi.string().max(50).optional(),
    twitter: Joi.string().max(50).optional(),
    youtube: Joi.string().max(50).optional(),
  }).optional(),
});

const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleAuthSchema), authController.loginWithGoogle);
router.get('/google/callback', authController.googleCallback);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), authController.resendVerificationEmail);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', validate(refreshTokenSchema), authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authController.getProfile);
router.put('/profile', validate(updateProfileSchema), authController.updateProfile);
router.delete('/account', validate(deleteAccountSchema), authController.deleteAccount);

export default router;
