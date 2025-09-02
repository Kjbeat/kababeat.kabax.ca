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
const userIdSchema = joi_1.default.object({
    id: validation_1.commonSchemas.mongoId,
});
const connectionController = {
    getConnections: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get connections endpoint - to be implemented' },
        });
    },
    getFollowers: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get followers endpoint - to be implemented' },
        });
    },
    getFollowing: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get following endpoint - to be implemented' },
        });
    },
    followUser: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Follow user endpoint - to be implemented' },
        });
    },
    unfollowUser: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Unfollow user endpoint - to be implemented' },
        });
    },
    getConnectionStatus: async (req, res, next) => {
        res.status(200).json({
            success: true,
            data: { message: 'Get connection status endpoint - to be implemented' },
        });
    },
};
router.use(auth_1.authenticate);
router.get('/', connectionController.getConnections);
router.get('/followers', connectionController.getFollowers);
router.get('/following', connectionController.getFollowing);
router.get('/:id/status', (0, validation_1.validateParams)(userIdSchema), connectionController.getConnectionStatus);
router.post('/:id/follow', (0, validation_1.validateParams)(userIdSchema), connectionController.followUser);
router.delete('/:id/follow', (0, validation_1.validateParams)(userIdSchema), connectionController.unfollowUser);
exports.default = router;
//# sourceMappingURL=connection.routes.js.map