"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const beat_1 = require("@/modules/beat");
const auth_1 = require("@/utils/auth");
const validation_1 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const beatController = new beat_1.BeatController();
const createBeatSchema = joi_1.default.object({
    title: joi_1.default.string().max(100).required(),
    description: joi_1.default.string().max(1000).optional(),
    producer: joi_1.default.string().max(50).required(),
    artwork: joi_1.default.string().uri().optional(),
    audioFile: joi_1.default.string().required(),
    bpm: joi_1.default.number().integer().min(60).max(300).required(),
    musicalKey: joi_1.default.string().required(),
    genre: joi_1.default.string().required(),
    tags: joi_1.default.array().items(joi_1.default.string().max(30)).optional(),
    price: joi_1.default.number().min(0).max(10000).required(),
    salePrice: joi_1.default.number().min(0).max(10000).optional(),
    isExclusive: joi_1.default.boolean().optional(),
    licenseTypes: joi_1.default.object({
        free: joi_1.default.boolean().optional(),
        mp3: joi_1.default.boolean().optional(),
        wav: joi_1.default.boolean().optional(),
        stems: joi_1.default.boolean().optional(),
        exclusive: joi_1.default.boolean().optional(),
    }).optional(),
    metadata: joi_1.default.object({
        duration: joi_1.default.number().min(1).required(),
        fileSize: joi_1.default.number().min(1).required(),
        format: joi_1.default.string().valid('mp3', 'wav', 'm4a', 'flac').required(),
        sampleRate: joi_1.default.number().valid(44100, 48000, 96000).required(),
        bitRate: joi_1.default.number().min(128).required(),
    }).required(),
});
const updateBeatSchema = joi_1.default.object({
    title: joi_1.default.string().max(100).optional(),
    description: joi_1.default.string().max(1000).optional(),
    artwork: joi_1.default.string().uri().optional(),
    bpm: joi_1.default.number().integer().min(60).max(300).optional(),
    musicalKey: joi_1.default.string().optional(),
    genre: joi_1.default.string().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(30)).optional(),
    price: joi_1.default.number().min(0).max(10000).optional(),
    salePrice: joi_1.default.number().min(0).max(10000).optional(),
    isExclusive: joi_1.default.boolean().optional(),
    licenseTypes: joi_1.default.object({
        free: joi_1.default.boolean().optional(),
        mp3: joi_1.default.boolean().optional(),
        wav: joi_1.default.boolean().optional(),
        stems: joi_1.default.boolean().optional(),
        exclusive: joi_1.default.boolean().optional(),
    }).optional(),
    isPublished: joi_1.default.boolean().optional(),
    isDraft: joi_1.default.boolean().optional(),
});
const beatIdSchema = joi_1.default.object({
    id: validation_1.commonSchemas.mongoId,
});
router.get('/featured', beatController.getFeaturedBeats);
router.get('/trending', beatController.getTrendingBeats);
router.get('/newest', beatController.getNewestBeats);
router.get('/search', beatController.searchBeats);
router.get('/:id', (0, validation_1.validateParams)(beatIdSchema), beatController.getBeatById);
router.get('/:id/related', (0, validation_1.validateParams)(beatIdSchema), beatController.getRelatedBeats);
router.post('/:id/play', (0, validation_1.validateParams)(beatIdSchema), auth_1.optionalAuth, beatController.incrementPlays);
router.post('/:id/like', (0, validation_1.validateParams)(beatIdSchema), auth_1.optionalAuth, beatController.incrementLikes);
router.post('/:id/share', (0, validation_1.validateParams)(beatIdSchema), auth_1.optionalAuth, beatController.incrementShares);
router.use(auth_1.authenticate);
router.post('/', (0, validation_1.validate)(createBeatSchema), beatController.createBeat);
router.get('/my/beats', beatController.getMyBeats);
router.put('/:id', (0, validation_1.validateParams)(beatIdSchema), (0, validation_1.validate)(updateBeatSchema), beatController.updateBeat);
router.delete('/:id', (0, validation_1.validateParams)(beatIdSchema), beatController.deleteBeat);
router.post('/:id/publish', (0, validation_1.validateParams)(beatIdSchema), beatController.publishBeat);
router.post('/:id/unpublish', (0, validation_1.validateParams)(beatIdSchema), beatController.unpublishBeat);
router.post('/:id/download', (0, validation_1.validateParams)(beatIdSchema), beatController.incrementDownloads);
router.get('/my/stats', beatController.getBeatStats);
router.get('/:id/analytics', (0, validation_1.validateParams)(beatIdSchema), beatController.getBeatAnalytics);
exports.default = router;
//# sourceMappingURL=beat.routes.js.map