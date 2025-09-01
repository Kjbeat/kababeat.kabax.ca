import { Router } from 'express';
import { authenticate } from '@/utils/auth';
import { validate, validateParams, commonSchemas } from '@/utils/validation';
import { MediaController } from '@/modules/media';
import Joi from 'joi';

const router = Router();
const mediaController = new MediaController();

// Validation schemas
const uploadSchema = Joi.object({
  type: Joi.string().valid('audio', 'image').required(),
  filename: Joi.string().required(),
  contentType: Joi.string().required(),
  size: Joi.number().required(),
});

const chunkedUploadSchema = Joi.object({
  filename: Joi.string().required(),
  contentType: Joi.string().required(),
  size: Joi.number().required(),
  type: Joi.string().valid('audio', 'image').required(),
});

const completeUploadSchema = Joi.object({
  uploadId: Joi.string().required(),
  metadata: Joi.object().optional(),
  processingOptions: Joi.object({
    generateWaveform: Joi.boolean().optional(),
    extractMetadata: Joi.boolean().optional(),
    createPreviews: Joi.boolean().optional(),
    generateMultipleQualities: Joi.boolean().optional(),
  }).optional(),
});

const fileKeySchema = Joi.object({
  key: Joi.string().required(),
});

const beatIdSchema = Joi.object({
  beatId: Joi.string().required(),
});

const uploadIdSchema = Joi.object({
  uploadId: Joi.string().required(),
});

// All media routes require authentication
router.use(authenticate);

// Chunked upload endpoints
router.post('/upload/initialize', validate(chunkedUploadSchema), mediaController.initializeChunkedUpload);
router.post('/upload/complete', validate(completeUploadSchema), mediaController.completeChunkedUpload);
router.get('/upload/:uploadId/status', validateParams(uploadIdSchema), mediaController.getUploadStatus);

// Streaming endpoints
router.get('/stream/:beatId', validateParams(beatIdSchema), mediaController.generateStreamingUrls);
router.get('/artwork/:beatId', validateParams(beatIdSchema), mediaController.generateArtworkUrls);

// Simple upload endpoints
router.post('/upload-url', validate(uploadSchema), mediaController.generateUploadUrl);
router.post('/download-url', mediaController.generateDownloadUrl);

// File management endpoints
router.delete('/:key', validateParams(fileKeySchema), mediaController.deleteFile);
router.get('/:key/info', validateParams(fileKeySchema), mediaController.getFileInfo);

export default router;
