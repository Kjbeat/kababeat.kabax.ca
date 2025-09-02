"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const errorHandler_1 = require("@/utils/errorHandler");
class UserController {
    constructor() {
        this.getProfile = async (req, res, next) => {
            try {
                const userId = req.params.userId || req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User ID is required', 400);
                }
                const user = await this.userService.getProfile(userId);
                const response = {
                    success: true,
                    data: user,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const user = await this.userService.updateProfile(userId, req.body);
                const response = {
                    success: true,
                    data: user,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.followUser = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                const { targetUserId } = req.params;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!targetUserId) {
                    throw new errorHandler_1.CustomError('Target user ID is required', 400);
                }
                await this.userService.followUser(userId, targetUserId);
                const response = {
                    success: true,
                    data: { message: 'User followed successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.unfollowUser = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                const { targetUserId } = req.params;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!targetUserId) {
                    throw new errorHandler_1.CustomError('Target user ID is required', 400);
                }
                await this.userService.unfollowUser(userId, targetUserId);
                const response = {
                    success: true,
                    data: { message: 'User unfollowed successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getFollowers = async (req, res, next) => {
            try {
                const userId = req.params.userId || req.user?.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User ID is required', 400);
                }
                const result = await this.userService.getFollowers(userId, page, limit);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getFollowing = async (req, res, next) => {
            try {
                const userId = req.params.userId || req.user?.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User ID is required', 400);
                }
                const result = await this.userService.getFollowing(userId, page, limit);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.searchUsers = async (req, res, next) => {
            try {
                const { query } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!query || typeof query !== 'string') {
                    throw new errorHandler_1.CustomError('Search query is required', 400);
                }
                const result = await this.userService.searchUsers(query, page, limit);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRecommendedUsers = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                const limit = parseInt(req.query.limit) || 10;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const users = await this.userService.getRecommendedUsers(userId, limit);
                const response = {
                    success: true,
                    data: users,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTopProducers = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 20;
                const producers = await this.userService.getTopProducers(limit);
                const response = {
                    success: true,
                    data: producers,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRecentUsers = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 20;
                const users = await this.userService.getRecentUsers(limit);
                const response = {
                    success: true,
                    data: users,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.userService = new user_service_1.UserService();
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map