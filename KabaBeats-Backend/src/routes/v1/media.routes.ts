import { Router } from 'express';
import { MediaController } from '@/modules/media/media.controller';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const mediaController = new MediaController();

// Validation schemas
const generateUploadUrlSchema = Joi.object({
  fileType: Joi.string().valid('audio', 'image', 'profile', 'artwork').required(),
  originalName: Joi.string().required(),
  contentType: Joi.string().required(),
  size: Joi.number().positive().required(),
  beatId: Joi.string().when('fileType', {
    is: Joi.string().valid('audio', 'artwork'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const confirmUploadSchema = Joi.object({
  key: Joi.string().required(),
  fileType: Joi.string().valid('audio', 'image', 'profile', 'artwork').required(),
  beatId: Joi.string().optional(),
});

const updateFileMetadataSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  isPublic: Joi.boolean().optional(),
});

// Chunked upload schemas
const initializeChunkedUploadSchema = Joi.object({
  fileName: Joi.string().required(),
  fileSize: Joi.number().positive().required(),
  contentType: Joi.string().required(),
  beatId: Joi.string().optional(),
  fileType: Joi.string().valid('audio', 'image', 'profile', 'artwork').required(),
});

const generateChunkUploadUrlSchema = Joi.object({
  sessionId: Joi.string().required(),
  chunkNumber: Joi.number().min(0).required(),
  chunkSize: Joi.number().positive().required(),
  totalChunks: Joi.number().positive().required(),
  fileName: Joi.string().required(),
  fileSize: Joi.number().positive().required(),
  contentType: Joi.string().required(),
  beatId: Joi.string().optional(),
  fileType: Joi.string().valid('audio', 'image', 'profile', 'artwork').required(),
});

const markChunkUploadedSchema = Joi.object({
  sessionId: Joi.string().required(),
  chunkNumber: Joi.number().min(0).required(),
});

const completeChunkedUploadSchema = Joi.object({
  sessionId: Joi.string().required(),
  checksum: Joi.string().required(),
});

// Routes
router.post(
  '/upload-url',
  authenticateToken,
  validateRequest(generateUploadUrlSchema),
  mediaController.generateUploadUrl.bind(mediaController)
);

router.post(
  '/confirm-upload',
  authenticateToken,
  validateRequest(confirmUploadSchema),
  mediaController.confirmUpload.bind(mediaController)
);

router.get(
  '/download/:fileId',
  authenticateToken,
  mediaController.getDownloadUrl.bind(mediaController)
);

router.delete(
  '/:fileId',
  authenticateToken,
  mediaController.deleteFile.bind(mediaController)
);

router.get(
  '/',
  authenticateToken,
  mediaController.getUserFiles.bind(mediaController)
);

router.put(
  '/:fileId/metadata',
  authenticateToken,
  validateRequest(updateFileMetadataSchema),
  mediaController.updateFileMetadata.bind(mediaController)
);

// Chunked upload routes
router.post(
  '/chunked/initialize',
  authenticateToken,
  validateRequest(initializeChunkedUploadSchema),
  mediaController.initializeChunkedUpload.bind(mediaController)
);

router.post(
  '/chunked/upload-url',
  authenticateToken,
  validateRequest(generateChunkUploadUrlSchema),
  mediaController.generateChunkUploadUrl.bind(mediaController)
);

router.post(
  '/chunked/mark-uploaded',
  authenticateToken,
  validateRequest(markChunkUploadedSchema),
  mediaController.markChunkUploaded.bind(mediaController)
);

router.get(
  '/chunked/progress/:sessionId',
  authenticateToken,
  mediaController.getUploadProgress.bind(mediaController)
);

router.post(
  '/chunked/complete',
  authenticateToken,
  validateRequest(completeChunkedUploadSchema),
  mediaController.completeChunkedUpload.bind(mediaController)
);

router.delete(
  '/chunked/:sessionId',
  authenticateToken,
  mediaController.abortChunkedUpload.bind(mediaController)
);



export default router;