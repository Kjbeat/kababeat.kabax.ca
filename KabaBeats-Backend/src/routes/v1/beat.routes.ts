import { Router } from 'express';
import { BeatController } from '@/modules/beat';
import { authenticate, optionalAuth } from '@/utils/auth';
import { validate, validateParams, commonSchemas } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const beatController = new BeatController();

// Validation schemas
const createBeatSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(1000).optional(),
  producer: Joi.string().max(50).required(),
  artwork: Joi.string().uri().optional(),
  audioFile: Joi.string().required(),
  bpm: Joi.number().integer().min(60).max(300).required(),
  musicalKey: Joi.string().required(),
  genre: Joi.string().required(),
  tags: Joi.array().items(Joi.string().max(30)).optional(),
  price: Joi.number().min(0).max(10000).required(),
  salePrice: Joi.number().min(0).max(10000).optional(),
  isExclusive: Joi.boolean().optional(),
  licenseTypes: Joi.object({
    free: Joi.boolean().optional(),
    mp3: Joi.boolean().optional(),
    wav: Joi.boolean().optional(),
    stems: Joi.boolean().optional(),
    exclusive: Joi.boolean().optional(),
  }).optional(),
  metadata: Joi.object({
    duration: Joi.number().min(1).required(),
    fileSize: Joi.number().min(1).required(),
    format: Joi.string().valid('mp3', 'wav', 'm4a', 'flac').required(),
    sampleRate: Joi.number().valid(44100, 48000, 96000).required(),
    bitRate: Joi.number().min(128).required(),
  }).required(),
});

const updateBeatSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  description: Joi.string().max(1000).optional(),
  artwork: Joi.string().uri().optional(),
  bpm: Joi.number().integer().min(60).max(300).optional(),
  musicalKey: Joi.string().optional(),
  genre: Joi.string().optional(),
  tags: Joi.array().items(Joi.string().max(30)).optional(),
  price: Joi.number().min(0).max(10000).optional(),
  salePrice: Joi.number().min(0).max(10000).optional(),
  isExclusive: Joi.boolean().optional(),
  licenseTypes: Joi.object({
    free: Joi.boolean().optional(),
    mp3: Joi.boolean().optional(),
    wav: Joi.boolean().optional(),
    stems: Joi.boolean().optional(),
    exclusive: Joi.boolean().optional(),
  }).optional(),
  isPublished: Joi.boolean().optional(),
  isDraft: Joi.boolean().optional(),
});

const beatIdSchema = Joi.object({
  id: commonSchemas.mongoId,
});

// Public routes (no authentication required)
router.get('/featured', beatController.getFeaturedBeats);
router.get('/trending', beatController.getTrendingBeats);
router.get('/newest', beatController.getNewestBeats);
router.get('/search', beatController.searchBeats);
router.get('/:id', validateParams(beatIdSchema), beatController.getBeatById);
router.get('/:id/related', validateParams(beatIdSchema), beatController.getRelatedBeats);

// Public interaction routes (optional authentication)
router.post('/:id/play', validateParams(beatIdSchema), optionalAuth, beatController.incrementPlays);
router.post('/:id/like', validateParams(beatIdSchema), optionalAuth, beatController.incrementLikes);
router.post('/:id/share', validateParams(beatIdSchema), optionalAuth, beatController.incrementShares);

// Protected routes (authentication required)
router.use(authenticate);

// Beat management routes
router.post('/', validate(createBeatSchema), beatController.createBeat);
router.get('/my/beats', beatController.getMyBeats);
router.put('/:id', validateParams(beatIdSchema), validate(updateBeatSchema), beatController.updateBeat);
router.delete('/:id', validateParams(beatIdSchema), beatController.deleteBeat);
router.post('/:id/publish', validateParams(beatIdSchema), beatController.publishBeat);
router.post('/:id/unpublish', validateParams(beatIdSchema), beatController.unpublishBeat);
router.post('/:id/download', validateParams(beatIdSchema), beatController.incrementDownloads);

// Analytics routes
router.get('/my/stats', beatController.getBeatStats);
router.get('/:id/analytics', validateParams(beatIdSchema), beatController.getBeatAnalytics);

export default router;
