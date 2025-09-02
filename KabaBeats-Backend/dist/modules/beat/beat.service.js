"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeatService = void 0;
const beat_model_1 = require("./beat.model");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
class BeatService {
    async createBeat(producerId, data) {
        try {
            const beat = new beat_model_1.Beat({
                ...data,
                producerId,
                isDraft: true,
                isPublished: false,
                stats: {
                    plays: 0,
                    likes: 0,
                    downloads: 0,
                    shares: 0,
                },
            });
            await beat.save();
            logger_1.logger.info(`New beat created: ${beat.title} by ${beat.producer}`);
            return beat;
        }
        catch (error) {
            logger_1.logger.error('Create beat error:', error);
            throw error;
        }
    }
    async getBeatById(beatId) {
        try {
            const beat = await beat_model_1.Beat.findById(beatId);
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found', 404);
            }
            return beat;
        }
        catch (error) {
            logger_1.logger.error('Get beat by ID error:', error);
            throw error;
        }
    }
    async getBeatByIdPublic(beatId) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, isPublished: true });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or not published', 404);
            }
            return beat;
        }
        catch (error) {
            logger_1.logger.error('Get public beat by ID error:', error);
            throw error;
        }
    }
    async updateBeat(beatId, producerId, data) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, producerId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined) {
                    beat[key] = data[key];
                }
            });
            await beat.save();
            logger_1.logger.info(`Beat updated: ${beat.title}`);
            return beat;
        }
        catch (error) {
            logger_1.logger.error('Update beat error:', error);
            throw error;
        }
    }
    async deleteBeat(beatId, producerId) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, producerId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            await beat_model_1.Beat.findByIdAndDelete(beatId);
            logger_1.logger.info(`Beat deleted: ${beat.title}`);
        }
        catch (error) {
            logger_1.logger.error('Delete beat error:', error);
            throw error;
        }
    }
    async getBeatsByProducer(producerId, options) {
        try {
            const { pagination = { page: 1, limit: 20 }, sort = '-createdAt', query: search, filters = {}, isPublished, isExclusive, } = options;
            const { page = 1, limit = 20 } = pagination;
            const query = { producerId };
            if (isPublished !== undefined) {
                query.isPublished = isPublished;
            }
            if (isExclusive !== undefined) {
                query.isExclusive = isExclusive;
            }
            if (search) {
                query.$text = { $search: search };
            }
            if (filters.genre) {
                query.genre = filters.genre;
            }
            if (filters.bpm) {
                query.bpm = filters.bpm;
            }
            if (filters.musicalKey) {
                query.musicalKey = filters.musicalKey;
            }
            if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                query.price = {};
                if (filters.priceMin !== undefined) {
                    query.price.$gte = filters.priceMin;
                }
                if (filters.priceMax !== undefined) {
                    query.price.$lte = filters.priceMax;
                }
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            const skip = (page - 1) * limit;
            const total = await beat_model_1.Beat.countDocuments(query);
            const beats = await beat_model_1.Beat.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);
            return {
                data: beats,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Get beats by producer error:', error);
            throw error;
        }
    }
    async searchBeats(options) {
        try {
            const { pagination = { page: 1, limit: 20 }, sort = '-createdAt', query: search, filters = {}, producerId, isPublished = true, isExclusive, } = options;
            const { page = 1, limit = 20 } = pagination;
            const query = { isPublished };
            if (producerId) {
                query.producerId = producerId;
            }
            if (isExclusive !== undefined) {
                query.isExclusive = isExclusive;
            }
            if (search) {
                query.$text = { $search: search };
            }
            if (filters.genre) {
                query.genre = filters.genre;
            }
            if (filters.bpm) {
                query.bpm = filters.bpm;
            }
            if (filters.musicalKey) {
                query.musicalKey = filters.musicalKey;
            }
            if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                query.price = {};
                if (filters.priceMin !== undefined) {
                    query.price.$gte = filters.priceMin;
                }
                if (filters.priceMax !== undefined) {
                    query.price.$lte = filters.priceMax;
                }
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            const skip = (page - 1) * limit;
            const total = await beat_model_1.Beat.countDocuments(query);
            const beats = await beat_model_1.Beat.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);
            return {
                data: beats,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Search beats error:', error);
            throw error;
        }
    }
    async getFeaturedBeats(limit = 10) {
        try {
            const beats = await beat_model_1.Beat.find({ isPublished: true })
                .sort({ 'stats.plays': -1, 'stats.likes': -1, createdAt: -1 })
                .limit(limit);
            return beats;
        }
        catch (error) {
            logger_1.logger.error('Get featured beats error:', error);
            throw error;
        }
    }
    async getTrendingBeats(limit = 10) {
        try {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const beats = await beat_model_1.Beat.find({
                isPublished: true,
                createdAt: { $gte: oneWeekAgo },
            })
                .sort({ 'stats.plays': -1, 'stats.likes': -1 })
                .limit(limit);
            return beats;
        }
        catch (error) {
            logger_1.logger.error('Get trending beats error:', error);
            throw error;
        }
    }
    async getNewestBeats(limit = 10) {
        try {
            const beats = await beat_model_1.Beat.find({ isPublished: true })
                .sort({ createdAt: -1 })
                .limit(limit);
            return beats;
        }
        catch (error) {
            logger_1.logger.error('Get newest beats error:', error);
            throw error;
        }
    }
    async getRelatedBeats(beatId, limit = 10) {
        try {
            const beat = await beat_model_1.Beat.findById(beatId);
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found', 404);
            }
            const beats = await beat_model_1.Beat.find({
                _id: { $ne: beatId },
                isPublished: true,
                $or: [
                    { genre: beat.genre },
                    { tags: { $in: beat.tags } },
                    { producerId: beat.producerId },
                ],
            })
                .sort({ 'stats.plays': -1 })
                .limit(limit);
            return beats;
        }
        catch (error) {
            logger_1.logger.error('Get related beats error:', error);
            throw error;
        }
    }
    async incrementPlays(beatId) {
        try {
            await beat_model_1.Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.plays': 1 } });
        }
        catch (error) {
            logger_1.logger.error('Increment plays error:', error);
            throw error;
        }
    }
    async incrementLikes(beatId) {
        try {
            await beat_model_1.Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.likes': 1 } });
        }
        catch (error) {
            logger_1.logger.error('Increment likes error:', error);
            throw error;
        }
    }
    async incrementDownloads(beatId) {
        try {
            await beat_model_1.Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.downloads': 1 } });
        }
        catch (error) {
            logger_1.logger.error('Increment downloads error:', error);
            throw error;
        }
    }
    async incrementShares(beatId) {
        try {
            await beat_model_1.Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.shares': 1 } });
        }
        catch (error) {
            logger_1.logger.error('Increment shares error:', error);
            throw error;
        }
    }
    async publishBeat(beatId, producerId) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, producerId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            beat.isPublished = true;
            beat.isDraft = false;
            await beat.save();
            logger_1.logger.info(`Beat published: ${beat.title}`);
            return beat;
        }
        catch (error) {
            logger_1.logger.error('Publish beat error:', error);
            throw error;
        }
    }
    async unpublishBeat(beatId, producerId) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, producerId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            beat.isPublished = false;
            beat.isDraft = true;
            await beat.save();
            logger_1.logger.info(`Beat unpublished: ${beat.title}`);
            return beat;
        }
        catch (error) {
            logger_1.logger.error('Unpublish beat error:', error);
            throw error;
        }
    }
    async getBeatStats(producerId) {
        try {
            const matchQuery = producerId ? { producerId } : {};
            const stats = await beat_model_1.Beat.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalBeats: { $sum: 1 },
                        totalPlays: { $sum: '$stats.plays' },
                        totalLikes: { $sum: '$stats.likes' },
                        totalDownloads: { $sum: '$stats.downloads' },
                        totalRevenue: { $sum: { $multiply: ['$price', '$stats.downloads'] } },
                        averagePrice: { $avg: '$price' },
                    },
                },
            ]);
            const genreStats = await beat_model_1.Beat.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$genre', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]);
            const keyStats = await beat_model_1.Beat.aggregate([
                { $match: matchQuery },
                { $group: { _id: '$musicalKey', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]);
            const result = stats[0] || {
                totalBeats: 0,
                totalPlays: 0,
                totalLikes: 0,
                totalDownloads: 0,
                totalRevenue: 0,
                averagePrice: 0,
            };
            return {
                ...result,
                topGenres: genreStats.map(item => ({ genre: item._id, count: item.count })),
                topKeys: keyStats.map(item => ({ key: item._id, count: item.count })),
            };
        }
        catch (error) {
            logger_1.logger.error('Get beat stats error:', error);
            throw error;
        }
    }
    async getBeatAnalytics(beatId, producerId) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, producerId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            return {
                beatId: beat._id,
                title: beat.title,
                stats: beat.stats,
                createdAt: beat.createdAt,
                updatedAt: beat.updatedAt,
            };
        }
        catch (error) {
            logger_1.logger.error('Get beat analytics error:', error);
            throw error;
        }
    }
}
exports.BeatService = BeatService;
//# sourceMappingURL=beat.service.js.map