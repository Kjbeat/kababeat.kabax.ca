"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
class UserService {
    async getProfile(userId) {
        try {
            const user = await user_model_1.UserProfile.findById(userId)
                .populate('followers', 'username firstName lastName avatar isVerified')
                .populate('following', 'username firstName lastName avatar isVerified');
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Get profile error:', error);
            throw error;
        }
    }
    async updateProfile(userId, data) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const allowedFields = [
                'firstName', 'lastName', 'bio', 'country', 'avatar',
                'socialLinks', 'preferences'
            ];
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    user[field] = data[field];
                }
            });
            await user.save();
            logger_1.logger.info(`Profile updated for user: ${user.email}`);
            return user;
        }
        catch (error) {
            logger_1.logger.error('Update profile error:', error);
            throw error;
        }
    }
    async followUser(userId, targetUserId) {
        try {
            if (userId === targetUserId) {
                throw new errorHandler_1.CustomError('Cannot follow yourself', 400);
            }
            const [user, targetUser] = await Promise.all([
                user_model_1.UserProfile.findById(userId),
                user_model_1.UserProfile.findById(targetUserId)
            ]);
            if (!user || !targetUser) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (user.following.includes(targetUserId)) {
                throw new errorHandler_1.CustomError('Already following this user', 400);
            }
            await user.follow(targetUserId);
            await targetUser.addFollower(userId);
            logger_1.logger.info(`User ${userId} followed ${targetUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Follow user error:', error);
            throw error;
        }
    }
    async unfollowUser(userId, targetUserId) {
        try {
            if (userId === targetUserId) {
                throw new errorHandler_1.CustomError('Cannot unfollow yourself', 400);
            }
            const [user, targetUser] = await Promise.all([
                user_model_1.UserProfile.findById(userId),
                user_model_1.UserProfile.findById(targetUserId)
            ]);
            if (!user || !targetUser) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            await user.unfollow(targetUserId);
            await targetUser.removeFollower(userId);
            logger_1.logger.info(`User ${userId} unfollowed ${targetUserId}`);
        }
        catch (error) {
            logger_1.logger.error('Unfollow user error:', error);
            throw error;
        }
    }
    async getFollowers(userId, page = 1, limit = 20) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const skip = (page - 1) * limit;
            const total = user.followers.length;
            const followers = await user_model_1.UserProfile.find({
                _id: { $in: user.followers }
            })
                .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
                .skip(skip)
                .limit(limit)
                .sort({ totalFollowers: -1 });
            return {
                users: followers,
                total,
                page,
                limit,
                hasMore: skip + followers.length < total
            };
        }
        catch (error) {
            logger_1.logger.error('Get followers error:', error);
            throw error;
        }
    }
    async getFollowing(userId, page = 1, limit = 20) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const skip = (page - 1) * limit;
            const total = user.following.length;
            const following = await user_model_1.UserProfile.find({
                _id: { $in: user.following }
            })
                .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
                .skip(skip)
                .limit(limit)
                .sort({ totalFollowers: -1 });
            return {
                users: following,
                total,
                page,
                limit,
                hasMore: skip + following.length < total
            };
        }
        catch (error) {
            logger_1.logger.error('Get following error:', error);
            throw error;
        }
    }
    async searchUsers(query, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const searchRegex = new RegExp(query, 'i');
            const searchQuery = {
                $or: [
                    { username: searchRegex },
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { bio: searchRegex }
                ],
                isActive: true
            };
            const [users, total] = await Promise.all([
                user_model_1.UserProfile.find(searchQuery)
                    .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
                    .skip(skip)
                    .limit(limit)
                    .sort({ totalFollowers: -1, totalBeats: -1 }),
                user_model_1.UserProfile.countDocuments(searchQuery)
            ]);
            return {
                users,
                total,
                page,
                limit,
                hasMore: skip + users.length < total
            };
        }
        catch (error) {
            logger_1.logger.error('Search users error:', error);
            throw error;
        }
    }
    async getRecommendedUsers(userId, limit = 10) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const recommendations = await user_model_1.UserProfile.find({
                _id: {
                    $nin: [userId, ...user.following]
                },
                isActive: true,
                $or: [
                    { country: user.country },
                    { 'stats.topGenres': { $in: user.stats.topGenres } }
                ]
            })
                .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers stats')
                .limit(limit)
                .sort({ totalFollowers: -1, totalBeats: -1 });
            return recommendations;
        }
        catch (error) {
            logger_1.logger.error('Get recommended users error:', error);
            throw error;
        }
    }
    async updateUserStats(userId, stats) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            await user.updateStats(stats);
            logger_1.logger.info(`Stats updated for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Update user stats error:', error);
            throw error;
        }
    }
    async incrementPlays(userId, count = 1) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            await user.incrementPlays(count);
        }
        catch (error) {
            logger_1.logger.error('Increment plays error:', error);
            throw error;
        }
    }
    async incrementLikes(userId, count = 1) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            await user.incrementLikes(count);
        }
        catch (error) {
            logger_1.logger.error('Increment likes error:', error);
            throw error;
        }
    }
    async verifyUser(userId) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            user.isVerified = true;
            await user.save();
            logger_1.logger.info(`User verified: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Verify user error:', error);
            throw error;
        }
    }
    async getTopProducers(limit = 20) {
        try {
            const producers = await user_model_1.UserProfile.find({
                isProducer: true,
                isActive: true
            })
                .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers totalPlays')
                .sort({ totalPlays: -1, totalFollowers: -1 })
                .limit(limit);
            return producers;
        }
        catch (error) {
            logger_1.logger.error('Get top producers error:', error);
            throw error;
        }
    }
    async getRecentUsers(limit = 20) {
        try {
            const users = await user_model_1.UserProfile.find({
                isActive: true
            })
                .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
                .sort({ createdAt: -1 })
                .limit(limit);
            return users;
        }
        catch (error) {
            logger_1.logger.error('Get recent users error:', error);
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map