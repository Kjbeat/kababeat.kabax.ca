import { Router } from 'express';
import { beatController } from '@/modules/beat/beat.controller';
import { authMiddleware, authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/utils/validation';
import Joi from 'joi';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audio field') as any, false);
      }
    } else if (file.fieldname === 'artwork') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for artwork field') as any, false);
      }
    } else if (file.fieldname === 'stems') {
      if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
        cb(null, true);
      } else {
        cb(new Error('Only ZIP files are allowed for stems field') as any, false);
      }
    } else {
      cb(new Error('Invalid field name') as any, false);
    }
  }
});

// Validation schemas
const createBeatSchema = Joi.object({
  title: Joi.string().required().trim().max(100),
  producer: Joi.string().required().trim().max(50),
  description: Joi.string().optional().trim().max(500),
  bpm: Joi.number().required().min(60).max(300),
  key: Joi.string().required().valid(
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor', 
    'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor',
    'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major', 
    'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major'
  ),
  genre: Joi.string().required().valid(
    'Hip Hop', 'Trap', 'R&B', 'Pop', 'LoFi', 'EDM', 'Drill', 'Afrobeat', 
    'Jazz', 'Ambient', 'Rock', 'Country', 'Classical', 'Reggae', 'Blues'
  ),
  mood: Joi.string().optional().valid(
    'Chill', 'Energetic', 'Dark', 'Happy', 'Sad', 'Aggressive', 
    'Romantic', 'Mysterious', 'Upbeat', 'Melancholic', 'Intense', 'Peaceful'
  ),
  tags: Joi.array().items(Joi.string().trim().max(20)).max(10).optional(),
  allowFreeDownload: Joi.boolean().optional(),
  status: Joi.string().optional().valid('draft', 'published', 'scheduled', 'archived'),
  collaborators: Joi.array().items(
    Joi.object({
      userId: Joi.string().optional(),
      name: Joi.string().required().trim(),
      email: Joi.string().required().email(),
      percent: Joi.number().required().min(0).max(100),
      role: Joi.string().optional().trim()
    })
  ).optional(),
  scheduledDate: Joi.date().optional().greater('now')
});

const updateBeatSchema = Joi.object({
  title: Joi.string().optional().trim().max(100),
  producer: Joi.string().optional().trim().max(50),
  description: Joi.string().optional().trim().max(500),
  bpm: Joi.number().optional().min(60).max(300),
  key: Joi.string().optional().valid(
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor', 
    'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor',
    'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major', 
    'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major'
  ),
  genre: Joi.string().optional().valid(
    'Hip Hop', 'Trap', 'R&B', 'Pop', 'LoFi', 'EDM', 'Drill', 'Afrobeat', 
    'Jazz', 'Ambient', 'Rock', 'Country', 'Classical', 'Reggae', 'Blues'
  ),
  mood: Joi.string().optional().valid(
    'Chill', 'Energetic', 'Dark', 'Happy', 'Sad', 'Aggressive', 
    'Romantic', 'Mysterious', 'Upbeat', 'Melancholic', 'Intense', 'Peaceful'
  ),
  tags: Joi.array().items(Joi.string().trim().max(20)).max(10).optional(),
  allowFreeDownload: Joi.boolean().optional(),
  collaborators: Joi.array().items(
    Joi.object({
      userId: Joi.string().optional(),
      name: Joi.string().required().trim(),
      email: Joi.string().required().email(),
      percent: Joi.number().required().min(0).max(100),
      role: Joi.string().optional().trim()
    })
  ).optional(),
  scheduledDate: Joi.date().optional().greater('now'),
  status: Joi.string().optional().valid('draft', 'published', 'scheduled', 'archived')
});

const scheduleBeatSchema = Joi.object({
  scheduledDate: Joi.date().required().greater('now')
});

const beatQuerySchema = Joi.object({
  page: Joi.number().optional().min(1),
  limit: Joi.number().optional().min(1).max(100),
  search: Joi.string().optional().trim(),
  genre: Joi.string().optional(),
  mood: Joi.string().optional(),
  key: Joi.string().optional(),
  minBPM: Joi.number().optional().min(60),
  maxBPM: Joi.number().optional().max(300),
  minPrice: Joi.number().optional().min(0),
  maxPrice: Joi.number().optional().min(0),
  sortBy: Joi.string().optional().valid('newest', 'oldest', 'price-low', 'price-high', 'popular', 'plays', 'likes'),
  status: Joi.string().optional().valid('draft', 'published', 'scheduled', 'archived')
});

const searchSchema = Joi.object({
  q: Joi.string().required().trim().min(1),
  page: Joi.number().optional().min(1),
  limit: Joi.number().optional().min(1).max(100),
  genre: Joi.string().optional(),
  mood: Joi.string().optional(),
  key: Joi.string().optional(),
  minBPM: Joi.number().optional().min(60),
  maxBPM: Joi.number().optional().max(300),
  minPrice: Joi.number().optional().min(0),
  maxPrice: Joi.number().optional().min(0),
  sortBy: Joi.string().optional().valid('newest', 'oldest', 'price-low', 'price-high', 'popular', 'plays', 'likes')
});

// Routes
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'artwork', maxCount: 1 },
    { name: 'stems', maxCount: 1 }
  ]),
  validateRequest(createBeatSchema),
  beatController.createBeat
);

router.get(
  '/',
  validateRequest(beatQuerySchema),
  beatController.getBeats
);

router.get(
  '/search',
  validateRequest(searchSchema),
  beatController.searchBeats
);

router.get(
  '/my-beats',
  authMiddleware,
  validateRequest(beatQuerySchema),
  beatController.getUserBeats
);

router.get(
  '/stats',
  authMiddleware,
  beatController.getBeatStats
);

router.get(
  '/:id',
  beatController.getBeatById
);

router.get(
  '/:id/artwork',
  beatController.getArtworkUrl
);

router.get(
  '/:id/audio',
  beatController.getAudioUrl
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateBeatSchema),
  beatController.updateBeat
);

router.delete(
  '/:id',
  authMiddleware,
  beatController.deleteBeat
);

router.patch(
  '/:id/publish',
  authMiddleware,
  beatController.publishBeat
);

router.patch(
  '/:id/unpublish',
  authMiddleware,
  beatController.unpublishBeat
);

router.patch(
  '/:id/schedule',
  authMiddleware,
  validateRequest(scheduleBeatSchema),
  beatController.scheduleBeat
);

router.patch(
  '/:id/plays',
  beatController.incrementPlays
);

router.patch(
  '/:id/likes',
  beatController.incrementLikes
);

router.patch(
  '/:id/downloads',
  beatController.incrementDownloads
);

router.patch(
  '/:id/sales',
  beatController.incrementSales
);

export default router;