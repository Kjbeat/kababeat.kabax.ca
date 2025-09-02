"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const media_controller_1 = require("@/modules/media/media.controller");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const mediaController = new media_controller_1.MediaController();
const generateUploadUrlSchema = joi_1.default.object({
    fileType: joi_1.default.string().valid('audio', 'image', 'profile', 'artwork').required(),
    originalName: joi_1.default.string().required(),
    contentType: joi_1.default.string().required(),
    size: joi_1.default.number().positive().required(),
    beatId: joi_1.default.string().when('fileType', {
        is: joi_1.default.string().valid('audio', 'artwork'),
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    }),
});
const confirmUploadSchema = joi_1.default.object({
    key: joi_1.default.string().required(),
    fileType: joi_1.default.string().valid('audio', 'image', 'profile', 'artwork').required(),
    beatId: joi_1.default.string().optional(),
});
const updateFileMetadataSchema = joi_1.default.object({
    title: joi_1.default.string().max(100).optional(),
    description: joi_1.default.string().max(500).optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(30)).max(10).optional(),
    isPublic: joi_1.default.boolean().optional(),
});
const initializeChunkedUploadSchema = joi_1.default.object({
    fileName: joi_1.default.string().required(),
    fileSize: joi_1.default.number().positive().required(),
    contentType: joi_1.default.string().required(),
    beatId: joi_1.default.string().optional(),
    fileType: joi_1.default.string().valid('audio', 'image', 'profile', 'artwork').required(),
});
const generateChunkUploadUrlSchema = joi_1.default.object({
    sessionId: joi_1.default.string().required(),
    chunkNumber: joi_1.default.number().min(0).required(),
    chunkSize: joi_1.default.number().positive().required(),
    totalChunks: joi_1.default.number().positive().required(),
    fileName: joi_1.default.string().required(),
    fileSize: joi_1.default.number().positive().required(),
    contentType: joi_1.default.string().required(),
    beatId: joi_1.default.string().optional(),
    fileType: joi_1.default.string().valid('audio', 'image', 'profile', 'artwork').required(),
});
const markChunkUploadedSchema = joi_1.default.object({
    sessionId: joi_1.default.string().required(),
    chunkNumber: joi_1.default.number().min(0).required(),
});
const completeChunkedUploadSchema = joi_1.default.object({
    sessionId: joi_1.default.string().required(),
    checksum: joi_1.default.string().required(),
});
router.post('/upload-url', auth_1.authenticateToken, (0, validation_1.validateRequest)(generateUploadUrlSchema), mediaController.generateUploadUrl.bind(mediaController));
router.post('/confirm-upload', auth_1.authenticateToken, (0, validation_1.validateRequest)(confirmUploadSchema), mediaController.confirmUpload.bind(mediaController));
router.get('/download/:fileId', auth_1.authenticateToken, mediaController.getDownloadUrl.bind(mediaController));
router.delete('/:fileId', auth_1.authenticateToken, mediaController.deleteFile.bind(mediaController));
router.get('/', auth_1.authenticateToken, mediaController.getUserFiles.bind(mediaController));
router.put('/:fileId/metadata', auth_1.authenticateToken, (0, validation_1.validateRequest)(updateFileMetadataSchema), mediaController.updateFileMetadata.bind(mediaController));
router.post('/chunked/initialize', auth_1.authenticateToken, (0, validation_1.validateRequest)(initializeChunkedUploadSchema), mediaController.initializeChunkedUpload.bind(mediaController));
router.post('/chunked/upload-url', auth_1.authenticateToken, (0, validation_1.validateRequest)(generateChunkUploadUrlSchema), mediaController.generateChunkUploadUrl.bind(mediaController));
router.post('/chunked/mark-uploaded', auth_1.authenticateToken, (0, validation_1.validateRequest)(markChunkUploadedSchema), mediaController.markChunkUploaded.bind(mediaController));
router.get('/chunked/progress/:sessionId', auth_1.authenticateToken, mediaController.getUploadProgress.bind(mediaController));
router.post('/chunked/complete', auth_1.authenticateToken, (0, validation_1.validateRequest)(completeChunkedUploadSchema), mediaController.completeChunkedUpload.bind(mediaController));
router.delete('/chunked/:sessionId', auth_1.authenticateToken, mediaController.abortChunkedUpload.bind(mediaController));
router.get('/stream/:beatId/hls', auth_1.authenticateToken, mediaController.generateHLSStreamingUrl.bind(mediaController));
router.get('/stream/:beatId/playlist', auth_1.authenticateToken, mediaController.getHLSPlaylist.bind(mediaController));
exports.default = router;
//# sourceMappingURL=media.routes.js.map