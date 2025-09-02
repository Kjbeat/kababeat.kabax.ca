"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistController = void 0;
const playlist_service_1 = require("./playlist.service");
const errorHandler_1 = require("@/utils/errorHandler");
class PlaylistController {
    constructor() {
        this.createPlaylist = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const playlist = await this.playlistService.createPlaylist(userId, req.body);
                const response = {
                    success: true,
                    data: playlist,
                };
                res.status(201).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                const playlist = await this.playlistService.getPlaylist(playlistId);
                const response = {
                    success: true,
                    data: playlist,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                const playlist = await this.playlistService.updatePlaylist(playlistId, userId, req.body);
                const response = {
                    success: true,
                    data: playlist,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                await this.playlistService.deletePlaylist(playlistId, userId);
                const response = {
                    success: true,
                    data: { message: 'Playlist deleted successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserPlaylists = async (req, res, next) => {
            try {
                const userId = req.params.userId || req.user?.userId;
                const isPublic = req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User ID is required', 400);
                }
                const playlists = await this.playlistService.getUserPlaylists(userId, isPublic);
                const response = {
                    success: true,
                    data: playlists,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getFeaturedPlaylists = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const playlists = await this.playlistService.getFeaturedPlaylists(limit);
                const response = {
                    success: true,
                    data: playlists,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTrendingPlaylists = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 20;
                const playlists = await this.playlistService.getTrendingPlaylists(limit);
                const response = {
                    success: true,
                    data: playlists,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.searchPlaylists = async (req, res, next) => {
            try {
                const { query } = req.query;
                const limit = parseInt(req.query.limit) || 20;
                if (!query || typeof query !== 'string') {
                    throw new errorHandler_1.CustomError('Search query is required', 400);
                }
                const playlists = await this.playlistService.searchPlaylists(query, limit);
                const response = {
                    success: true,
                    data: playlists,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.addTrackToPlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const { beatId } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                if (!beatId) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                await this.playlistService.addTrackToPlaylist(playlistId, userId, beatId);
                const response = {
                    success: true,
                    data: { message: 'Track added to playlist successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.removeTrackFromPlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const { beatId } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                if (!beatId) {
                    throw new errorHandler_1.CustomError('Beat ID is required', 400);
                }
                await this.playlistService.removeTrackFromPlaylist(playlistId, userId, beatId);
                const response = {
                    success: true,
                    data: { message: 'Track removed from playlist successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.reorderPlaylistTracks = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const { trackIds } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                if (!trackIds || !Array.isArray(trackIds)) {
                    throw new errorHandler_1.CustomError('Track IDs array is required', 400);
                }
                await this.playlistService.reorderPlaylistTracks(playlistId, userId, trackIds);
                const response = {
                    success: true,
                    data: { message: 'Playlist tracks reordered successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.likePlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                await this.playlistService.likePlaylist(playlistId, userId);
                const response = {
                    success: true,
                    data: { message: 'Playlist liked successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.unlikePlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                await this.playlistService.unlikePlaylist(playlistId, userId);
                const response = {
                    success: true,
                    data: { message: 'Playlist unliked successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.sharePlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                await this.playlistService.sharePlaylist(playlistId, userId);
                const response = {
                    success: true,
                    data: { message: 'Playlist shared successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.playPlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                await this.playlistService.playPlaylist(playlistId);
                const response = {
                    success: true,
                    data: { message: 'Playlist played successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPlaylistTracks = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                const tracks = await this.playlistService.getPlaylistTracks(playlistId);
                const response = {
                    success: true,
                    data: tracks,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.duplicatePlaylist = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                const { newTitle } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                const playlist = await this.playlistService.duplicatePlaylist(playlistId, userId, newTitle);
                const response = {
                    success: true,
                    data: playlist,
                };
                res.status(201).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPlaylistStats = async (req, res, next) => {
            try {
                const { playlistId } = req.params;
                if (!playlistId) {
                    throw new errorHandler_1.CustomError('Playlist ID is required', 400);
                }
                const stats = await this.playlistService.getPlaylistStats(playlistId);
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
        this.playlistService = new playlist_service_1.PlaylistService();
    }
}
exports.PlaylistController = PlaylistController;
//# sourceMappingURL=playlist.controller.js.map