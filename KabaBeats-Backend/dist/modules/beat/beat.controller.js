"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeatController = void 0;
const beat_service_1 = require("./beat.service");
const errorHandler_1 = require("@/utils/errorHandler");
class BeatController {
    constructor() {
        this.createBeat = async (req, res, next) => {
            try {
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const beat = await this.beatService.createBeat(producerId, req.body);
                const response = {
                    success: true,
                    data: beat,
                };
                res.status(201).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getBeatById = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const beat = await this.beatService.getBeatByIdPublic(id);
                const response = {
                    success: true,
                    data: beat,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateBeat = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const beat = await this.beatService.updateBeat(id, producerId, req.body);
                const response = {
                    success: true,
                    data: beat,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteBeat = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                await this.beatService.deleteBeat(id, producerId);
                const response = {
                    success: true,
                    data: { message: 'Beat deleted successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMyBeats = async (req, res, next) => {
            try {
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const options = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                    sort: req.query.sort || '-createdAt',
                    search: req.query.search,
                    filters: {
                        ...(req.query.genre && { genre: req.query.genre }),
                        ...(req.query.bpm && { bpm: parseInt(req.query.bpm) }),
                        ...(req.query.key && { musicalKey: req.query.key }),
                        ...(req.query.priceMin && { priceMin: parseFloat(req.query.priceMin) }),
                        ...(req.query.priceMax && { priceMax: parseFloat(req.query.priceMax) }),
                        ...(req.query.tags && { tags: req.query.tags.split(',') }),
                    },
                    ...(req.query.published !== undefined && { isPublished: req.query.published === 'true' }),
                    ...(req.query.exclusive !== undefined && { isExclusive: req.query.exclusive === 'true' }),
                };
                const result = await this.beatService.getBeatsByProducer(producerId, options);
                const response = {
                    success: true,
                    data: result.data,
                    pagination: result.pagination,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.searchBeats = async (req, res, next) => {
            try {
                const options = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                    sort: req.query.sort || '-createdAt',
                    search: req.query.q,
                    filters: {
                        ...(req.query.genre && { genre: req.query.genre }),
                        ...(req.query.bpm && { bpm: parseInt(req.query.bpm) }),
                        ...(req.query.key && { musicalKey: req.query.key }),
                        ...(req.query.priceMin && { priceMin: parseFloat(req.query.priceMin) }),
                        ...(req.query.priceMax && { priceMax: parseFloat(req.query.priceMax) }),
                        ...(req.query.tags && { tags: req.query.tags.split(',') }),
                    },
                    producerId: req.query.producer,
                    isPublished: req.query.published !== 'false',
                    ...(req.query.exclusive !== undefined && { isExclusive: req.query.exclusive === 'true' }),
                };
                const result = await this.beatService.searchBeats(options);
                const response = {
                    success: true,
                    data: result.data,
                    pagination: result.pagination,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getFeaturedBeats = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const beats = await this.beatService.getFeaturedBeats(limit);
                const response = {
                    success: true,
                    data: beats,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTrendingBeats = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const beats = await this.beatService.getTrendingBeats(limit);
                const response = {
                    success: true,
                    data: beats,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getNewestBeats = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const beats = await this.beatService.getNewestBeats(limit);
                const response = {
                    success: true,
                    data: beats,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRelatedBeats = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const limit = parseInt(req.query.limit) || 10;
                const beats = await this.beatService.getRelatedBeats(id, limit);
                const response = {
                    success: true,
                    data: beats,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.incrementPlays = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                await this.beatService.incrementPlays(id);
                const response = {
                    success: true,
                    data: { message: 'Play count incremented' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.incrementLikes = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                await this.beatService.incrementLikes(id);
                const response = {
                    success: true,
                    data: { message: 'Like count incremented' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.incrementDownloads = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                await this.beatService.incrementDownloads(id);
                const response = {
                    success: true,
                    data: { message: 'Download count incremented' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.incrementShares = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                await this.beatService.incrementShares(id);
                const response = {
                    success: true,
                    data: { message: 'Share count incremented' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.publishBeat = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const beat = await this.beatService.publishBeat(id, producerId);
                const response = {
                    success: true,
                    data: beat,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.unpublishBeat = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const beat = await this.beatService.unpublishBeat(id, producerId);
                const response = {
                    success: true,
                    data: beat,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getBeatStats = async (req, res, next) => {
            try {
                const producerId = req.user?.userId;
                const stats = await this.beatService.getBeatStats(producerId);
                const response = {
                    success: true,
                    data: stats,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getBeatAnalytics = async (req, res, next) => {
            try {
                const { id } = req.params;
                if (!id) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                const producerId = req.user?.userId;
                if (!producerId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const analytics = await this.beatService.getBeatAnalytics(id, producerId);
                const response = {
                    success: true,
                    data: analytics,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.beatService = new beat_service_1.BeatService();
    }
}
exports.BeatController = BeatController;
//# sourceMappingURL=beat.controller.js.map