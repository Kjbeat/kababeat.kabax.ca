"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistService = void 0;
const playlist_model_1 = require("./playlist.model");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
const user_model_1 = require("../user/user.model");
const beat_model_1 = require("../beat/beat.model");
class PlaylistService {
    async createPlaylist(userId, data) {
        try {
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const playlist = new playlist_model_1.Playlist({
                ...data,
                curator: userId,
                curatorName: user.displayName || user.username,
                curatorAvatar: user.avatar,
                tracks: [],
                trackCount: 0,
            });
            await playlist.save();
            logger_1.logger.info(`Playlist created: ${playlist.title} by ${user.username}`);
            return playlist;
        }
        catch (error) {
            logger_1.logger.error('Create playlist error:', error);
            throw error;
        }
    }
    async getPlaylist(playlistId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId)
                .populate('curator', 'username firstName lastName avatar isVerified');
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            return playlist;
        }
        catch (error) {
            logger_1.logger.error('Get playlist error:', error);
            throw error;
        }
    }
    async updatePlaylist(playlistId, userId, data) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            if (playlist.curator.toString() !== userId) {
                throw new errorHandler_1.CustomError('Not authorized to update this playlist', 403);
            }
            const allowedFields = [
                'title', 'description', 'coverImage', 'isPublic',
                'tags', 'genre', 'mood'
            ];
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    playlist[field] = data[field];
                }
            });
            await playlist.save();
            logger_1.logger.info(`Playlist updated: ${playlist.title}`);
            return playlist;
        }
        catch (error) {
            logger_1.logger.error('Update playlist error:', error);
            throw error;
        }
    }
    async deletePlaylist(playlistId, userId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            if (playlist.curator.toString() !== userId) {
                throw new errorHandler_1.CustomError('Not authorized to delete this playlist', 403);
            }
            await playlist_model_1.Playlist.findByIdAndDelete(playlistId);
            logger_1.logger.info(`Playlist deleted: ${playlist.title}`);
        }
        catch (error) {
            logger_1.logger.error('Delete playlist error:', error);
            throw error;
        }
    }
    async getUserPlaylists(userId, isPublic) {
        try {
            const query = { curator: userId };
            if (isPublic !== undefined) {
                query.isPublic = isPublic;
            }
            const playlists = await playlist_model_1.Playlist.find(query)
                .sort({ updatedAt: -1 });
            return playlists;
        }
        catch (error) {
            logger_1.logger.error('Get user playlists error:', error);
            throw error;
        }
    }
    async getFeaturedPlaylists(limit = 10) {
        try {
            const playlists = await playlist_model_1.Playlist.findFeatured(limit);
            return playlists;
        }
        catch (error) {
            logger_1.logger.error('Get featured playlists error:', error);
            throw error;
        }
    }
    async getTrendingPlaylists(limit = 20) {
        try {
            const playlists = await playlist_model_1.Playlist.findTrending(limit);
            return playlists;
        }
        catch (error) {
            logger_1.logger.error('Get trending playlists error:', error);
            throw error;
        }
    }
    async searchPlaylists(query, limit = 20) {
        try {
            const playlists = await playlist_model_1.Playlist.searchPlaylists(query, limit);
            return playlists;
        }
        catch (error) {
            logger_1.logger.error('Search playlists error:', error);
            throw error;
        }
    }
    async addTrackToPlaylist(playlistId, userId, beatId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            if (playlist.curator.toString() !== userId) {
                throw new errorHandler_1.CustomError('Not authorized to modify this playlist', 403);
            }
            const beat = await beat_model_1.Beat.findById(beatId);
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found', 404);
            }
            await playlist.addTrack(beatId);
            logger_1.logger.info(`Track added to playlist: ${beat.title} -> ${playlist.title}`);
        }
        catch (error) {
            logger_1.logger.error('Add track to playlist error:', error);
            throw error;
        }
    }
    async removeTrackFromPlaylist(playlistId, userId, beatId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            if (playlist.curator.toString() !== userId) {
                throw new errorHandler_1.CustomError('Not authorized to modify this playlist', 403);
            }
            await playlist.removeTrack(beatId);
            logger_1.logger.info(`Track removed from playlist: ${beatId} -> ${playlist.title}`);
        }
        catch (error) {
            logger_1.logger.error('Remove track from playlist error:', error);
            throw error;
        }
    }
    async reorderPlaylistTracks(playlistId, userId, trackIds) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            if (playlist.curator.toString() !== userId) {
                throw new errorHandler_1.CustomError('Not authorized to modify this playlist', 403);
            }
            await playlist.reorderTracks(trackIds);
            logger_1.logger.info(`Playlist tracks reordered: ${playlist.title}`);
        }
        catch (error) {
            logger_1.logger.error('Reorder playlist tracks error:', error);
            throw error;
        }
    }
    async likePlaylist(playlistId, userId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            await playlist.incrementLikes();
            logger_1.logger.info(`Playlist liked: ${playlist.title} by user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Like playlist error:', error);
            throw error;
        }
    }
    async unlikePlaylist(playlistId, userId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            await playlist.incrementLikes(-1);
            logger_1.logger.info(`Playlist unliked: ${playlist.title} by user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Unlike playlist error:', error);
            throw error;
        }
    }
    async sharePlaylist(playlistId, userId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            await playlist.incrementShares();
            logger_1.logger.info(`Playlist shared: ${playlist.title} by user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Share playlist error:', error);
            throw error;
        }
    }
    async playPlaylist(playlistId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            await playlist.incrementPlays();
            logger_1.logger.info(`Playlist played: ${playlist.title}`);
        }
        catch (error) {
            logger_1.logger.error('Play playlist error:', error);
            throw error;
        }
    }
    async getPlaylistTracks(playlistId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId)
                .populate({
                path: 'tracks',
                model: 'Beat',
                select: 'title producer artwork bpm key genre mood price duration isLiked'
            });
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            return playlist.tracks;
        }
        catch (error) {
            logger_1.logger.error('Get playlist tracks error:', error);
            throw error;
        }
    }
    async duplicatePlaylist(playlistId, userId, newTitle) {
        try {
            const originalPlaylist = await playlist_model_1.Playlist.findById(playlistId);
            if (!originalPlaylist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            const user = await user_model_1.UserProfile.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const duplicatedPlaylist = new playlist_model_1.Playlist({
                title: newTitle || `${originalPlaylist.title} (Copy)`,
                description: originalPlaylist.description,
                coverImage: originalPlaylist.coverImage,
                isPublic: false,
                curator: userId,
                curatorName: user.displayName || user.username,
                curatorAvatar: user.avatar,
                tracks: [...originalPlaylist.tracks],
                trackCount: originalPlaylist.trackCount,
                tags: [...originalPlaylist.tags],
                genre: originalPlaylist.genre,
                mood: originalPlaylist.mood,
            });
            await duplicatedPlaylist.save();
            logger_1.logger.info(`Playlist duplicated: ${originalPlaylist.title} -> ${duplicatedPlaylist.title}`);
            return duplicatedPlaylist;
        }
        catch (error) {
            logger_1.logger.error('Duplicate playlist error:', error);
            throw error;
        }
    }
    async getPlaylistStats(playlistId) {
        try {
            const playlist = await playlist_model_1.Playlist.findById(playlistId);
            if (!playlist) {
                throw new errorHandler_1.CustomError('Playlist not found', 404);
            }
            return {
                totalPlays: playlist.totalPlays,
                totalLikes: playlist.totalLikes,
                totalShares: playlist.totalShares,
                trackCount: playlist.trackCount,
                duration: 0,
                ...(playlist.lastPlayedAt && { lastPlayedAt: playlist.lastPlayedAt }),
                createdAt: playlist.createdAt,
                updatedAt: playlist.updatedAt,
            };
        }
        catch (error) {
            logger_1.logger.error('Get playlist stats error:', error);
            throw error;
        }
    }
}
exports.PlaylistService = PlaylistService;
//# sourceMappingURL=playlist.service.js.map