"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/utils/auth");
const validation_1 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const creatorIdSchema = joi_1.default.object({
    id: validation_1.commonSchemas.mongoId,
});
const creatorSearchSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    search: joi_1.default.string().max(100).optional(),
    genre: joi_1.default.string().max(50).optional(),
    country: joi_1.default.string().max(50).optional(),
    verified: joi_1.default.boolean().optional(),
});
const creatorController = {
    getCreatorProfile: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get creator profile endpoint - to be implemented' },
        });
    },
    getCreatorBeats: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get creator beats endpoint - to be implemented' },
        });
    },
    getCreatorStats: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get creator stats endpoint - to be implemented' },
        });
    },
    searchCreators: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Search creators endpoint - to be implemented' },
        });
    },
    getTopCreators: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get top creators endpoint - to be implemented' },
        });
    },
    getNewCreators: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get new creators endpoint - to be implemented' },
        });
    },
};
router.get('/search', (0, validation_1.validate)(creatorSearchSchema), auth_1.optionalAuth, creatorController.searchCreators);
router.get('/top', creatorController.getTopCreators);
router.get('/new', creatorController.getNewCreators);
router.get('/:id', (0, validation_1.validateParams)(creatorIdSchema), auth_1.optionalAuth, creatorController.getCreatorProfile);
router.get('/:id/beats', (0, validation_1.validateParams)(creatorIdSchema), auth_1.optionalAuth, creatorController.getCreatorBeats);
router.get('/:id/stats', (0, validation_1.validateParams)(creatorIdSchema), auth_1.optionalAuth, creatorController.getCreatorStats);
exports.default = router;
//# sourceMappingURL=creator.routes.js.map