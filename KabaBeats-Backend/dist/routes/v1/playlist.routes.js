"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playlist_controller_1 = require("@/modules/playlist/playlist.controller");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const playlistController = new playlist_controller_1.PlaylistController();
const createPlaylistSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().max(500).optional(),
    coverImage: joi_1.default.string().uri().optional(),
    isPublic: joi_1.default.boolean().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
    genre: joi_1.default.string().max(50).optional(),
    mood: joi_1.default.string().max(50).optional(),
});
const updatePlaylistSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(100).optional(),
    description: joi_1.default.string().max(500).optional(),
    coverImage: joi_1.default.string().uri().optional(),
    isPublic: joi_1.default.boolean().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
    genre: joi_1.default.string().max(50).optional(),
    mood: joi_1.default.string().max(50).optional(),
});
const playlistIdSchema = joi_1.default.object({
    playlistId: joi_1.default.string().required(),
});
const userIdSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
});
const addTrackSchema = joi_1.default.object({
    beatId: joi_1.default.string().required(),
});
const removeTrackSchema = joi_1.default.object({
    beatId: joi_1.default.string().required(),
});
const reorderTracksSchema = joi_1.default.object({
    trackIds: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
});
const duplicatePlaylistSchema = joi_1.default.object({
    newTitle: joi_1.default.string().min(1).max(100).optional(),
});
const searchSchema = joi_1.default.object({
    query: joi_1.default.string().min(1).max(100).required(),
    limit: joi_1.default.number().integer().min(1).max(50).optional(),
});
router.get('/featured', playlistController.getFeaturedPlaylists);
router.get('/trending', playlistController.getTrendingPlaylists);
router.get('/search', (0, validation_1.validate)(searchSchema), playlistController.searchPlaylists);
router.get('/:playlistId', (0, validation_1.validateParams)(playlistIdSchema), playlistController.getPlaylist);
router.get('/:playlistId/tracks', (0, validation_1.validateParams)(playlistIdSchema), playlistController.getPlaylistTracks);
router.get('/:playlistId/stats', (0, validation_1.validateParams)(playlistIdSchema), playlistController.getPlaylistStats);
router.post('/:playlistId/play', (0, validation_1.validateParams)(playlistIdSchema), playlistController.playPlaylist);
router.use(auth_1.authMiddleware);
router.post('/', (0, validation_1.validate)(createPlaylistSchema), playlistController.createPlaylist);
router.put('/:playlistId', (0, validation_1.validateParams)(playlistIdSchema), (0, validation_1.validate)(updatePlaylistSchema), playlistController.updatePlaylist);
router.delete('/:playlistId', (0, validation_1.validateParams)(playlistIdSchema), playlistController.deletePlaylist);
router.get('/user/:userId', (0, validation_1.validateParams)(userIdSchema), playlistController.getUserPlaylists);
router.get('/user/me', playlistController.getUserPlaylists);
router.post('/:playlistId/tracks', (0, validation_1.validateParams)(playlistIdSchema), (0, validation_1.validate)(addTrackSchema), playlistController.addTrackToPlaylist);
router.delete('/:playlistId/tracks', (0, validation_1.validateParams)(playlistIdSchema), (0, validation_1.validate)(removeTrackSchema), playlistController.removeTrackFromPlaylist);
router.put('/:playlistId/tracks/reorder', (0, validation_1.validateParams)(playlistIdSchema), (0, validation_1.validate)(reorderTracksSchema), playlistController.reorderPlaylistTracks);
router.post('/:playlistId/like', (0, validation_1.validateParams)(playlistIdSchema), playlistController.likePlaylist);
router.delete('/:playlistId/like', (0, validation_1.validateParams)(playlistIdSchema), playlistController.unlikePlaylist);
router.post('/:playlistId/share', (0, validation_1.validateParams)(playlistIdSchema), playlistController.sharePlaylist);
router.post('/:playlistId/duplicate', (0, validation_1.validateParams)(playlistIdSchema), (0, validation_1.validate)(duplicatePlaylistSchema), playlistController.duplicatePlaylist);
exports.default = router;
//# sourceMappingURL=playlist.routes.js.map