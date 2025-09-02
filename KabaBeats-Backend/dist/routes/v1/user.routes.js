"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("@/modules/user/user.controller");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
const updateProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string().max(50).optional(),
    lastName: joi_1.default.string().max(50).optional(),
    bio: joi_1.default.string().max(500).optional(),
    country: joi_1.default.string().max(100).optional(),
    avatar: joi_1.default.string().uri().optional(),
    socialLinks: joi_1.default.object({
        website: joi_1.default.string().uri().optional(),
        instagram: joi_1.default.string().pattern(/^@?[a-zA-Z0-9._]+$/).optional(),
        twitter: joi_1.default.string().pattern(/^@?[a-zA-Z0-9_]+$/).optional(),
        youtube: joi_1.default.string().pattern(/^@?[a-zA-Z0-9._-]+$/).optional(),
        soundcloud: joi_1.default.string().pattern(/^[a-zA-Z0-9._-]+$/).optional(),
        spotify: joi_1.default.string().pattern(/^[a-zA-Z0-9._-]+$/).optional(),
    }).optional(),
    preferences: joi_1.default.object({
        notifications: joi_1.default.object({
            email: joi_1.default.boolean().optional(),
            push: joi_1.default.boolean().optional(),
            marketing: joi_1.default.boolean().optional(),
        }).optional(),
        privacy: joi_1.default.object({
            showEmail: joi_1.default.boolean().optional(),
            showFollowers: joi_1.default.boolean().optional(),
            showFollowing: joi_1.default.boolean().optional(),
        }).optional(),
    }).optional(),
});
const userIdSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
});
const targetUserIdSchema = joi_1.default.object({
    targetUserId: joi_1.default.string().required(),
});
const searchSchema = joi_1.default.object({
    query: joi_1.default.string().min(1).max(100).required(),
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
});
router.get('/search', (0, validation_1.validate)(searchSchema), userController.searchUsers);
router.get('/top-producers', userController.getTopProducers);
router.get('/recent', userController.getRecentUsers);
router.get('/:userId', (0, validation_1.validateParams)(userIdSchema), userController.getProfile);
router.get('/:userId/followers', (0, validation_1.validateParams)(userIdSchema), userController.getFollowers);
router.get('/:userId/following', (0, validation_1.validateParams)(userIdSchema), userController.getFollowing);
router.use(auth_1.authMiddleware);
router.put('/profile', (0, validation_1.validate)(updateProfileSchema), userController.updateProfile);
router.get('/profile/me', userController.getProfile);
router.post('/:targetUserId/follow', (0, validation_1.validateParams)(targetUserIdSchema), userController.followUser);
router.delete('/:targetUserId/follow', (0, validation_1.validateParams)(targetUserIdSchema), userController.unfollowUser);
router.get('/recommendations', userController.getRecommendedUsers);
exports.default = router;
//# sourceMappingURL=user.routes.js.map