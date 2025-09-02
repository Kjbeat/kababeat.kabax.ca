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
const browseSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sort: joi_1.default.string().default('-createdAt'),
    search: joi_1.default.string().max(100).optional(),
    genre: joi_1.default.string().max(50).optional(),
    bpm: joi_1.default.number().integer().min(60).max(300).optional(),
    key: joi_1.default.string().max(10).optional(),
    priceMin: joi_1.default.number().min(0).optional(),
    priceMax: joi_1.default.number().min(0).optional(),
    tags: joi_1.default.string().optional(),
    producer: joi_1.default.string().max(50).optional(),
    exclusive: joi_1.default.boolean().optional(),
});
const browseController = {
    browseBeats: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Browse beats endpoint - to be implemented' },
        });
    },
    getGenres: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get genres endpoint - to be implemented' },
        });
    },
    getMoods: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get moods endpoint - to be implemented' },
        });
    },
    getKeys: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get keys endpoint - to be implemented' },
        });
    },
    getFilters: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get filters endpoint - to be implemented' },
        });
    },
};
router.get('/beats', (0, validation_1.validate)(browseSchema), auth_1.optionalAuth, browseController.browseBeats);
router.get('/genres', browseController.getGenres);
router.get('/moods', browseController.getMoods);
router.get('/keys', browseController.getKeys);
router.get('/filters', browseController.getFilters);
exports.default = router;
//# sourceMappingURL=browse.routes.js.map