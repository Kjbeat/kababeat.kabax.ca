import { Router } from 'express';
import { UserController } from '@/modules/user/user.controller';
import { authMiddleware } from '@/middleware/auth';
import { validate, validateParams } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const userController = new UserController();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  bio: Joi.string().max(500).optional(),
  country: Joi.string().max(100).optional(),
  avatar: Joi.string().uri().optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().optional(),
    instagram: Joi.string().pattern(/^@?[a-zA-Z0-9._]+$/).optional(),
    twitter: Joi.string().pattern(/^@?[a-zA-Z0-9_]+$/).optional(),
    youtube: Joi.string().pattern(/^@?[a-zA-Z0-9._-]+$/).optional(),
    soundcloud: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).optional(),
    spotify: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).optional(),
  }).optional(),
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      marketing: Joi.boolean().optional(),
    }).optional(),
    privacy: Joi.object({
      showEmail: Joi.boolean().optional(),
      showFollowers: Joi.boolean().optional(),
      showFollowing: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

const userIdSchema = Joi.object({
  userId: Joi.string().required(),
});

const targetUserIdSchema = Joi.object({
  targetUserId: Joi.string().required(),
});

const searchSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// Public routes
router.get('/search', validate(searchSchema), userController.searchUsers);
router.get('/top-producers', userController.getTopProducers);
router.get('/recent', userController.getRecentUsers);
router.get('/:userId', validateParams(userIdSchema), userController.getProfile);
router.get('/:userId/followers', validateParams(userIdSchema), userController.getFollowers);
router.get('/:userId/following', validateParams(userIdSchema), userController.getFollowing);

// Protected routes
router.use(authMiddleware);

// Profile management
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.get('/profile/me', userController.getProfile);

// Social features
router.post('/:targetUserId/follow', validateParams(targetUserIdSchema), userController.followUser);
router.delete('/:targetUserId/follow', validateParams(targetUserIdSchema), userController.unfollowUser);

// Recommendations
router.get('/recommendations', userController.getRecommendedUsers);

export default router;