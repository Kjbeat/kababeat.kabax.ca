import { Router } from 'express';
import { PlaylistController } from '@/modules/playlist/playlist.controller';
import { authMiddleware } from '@/middleware/auth';
import { validate, validateParams } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const playlistController = new PlaylistController();

// Validation schemas
const createPlaylistSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  coverImage: Joi.string().uri().optional(),
  isPublic: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  genre: Joi.string().max(50).optional(),
  mood: Joi.string().max(50).optional(),
});

const updatePlaylistSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  coverImage: Joi.string().uri().optional(),
  isPublic: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  genre: Joi.string().max(50).optional(),
  mood: Joi.string().max(50).optional(),
});

const playlistIdSchema = Joi.object({
  playlistId: Joi.string().required(),
});

const userIdSchema = Joi.object({
  userId: Joi.string().required(),
});

const addTrackSchema = Joi.object({
  beatId: Joi.string().required(),
});

const removeTrackSchema = Joi.object({
  beatId: Joi.string().required(),
});

const reorderTracksSchema = Joi.object({
  trackIds: Joi.array().items(Joi.string()).min(1).required(),
});

const duplicatePlaylistSchema = Joi.object({
  newTitle: Joi.string().min(1).max(100).optional(),
});

const searchSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
  limit: Joi.number().integer().min(1).max(50).optional(),
});

// Public routes
router.get('/featured', playlistController.getFeaturedPlaylists);
router.get('/trending', playlistController.getTrendingPlaylists);
router.get('/search', validate(searchSchema), playlistController.searchPlaylists);
router.get('/:playlistId', validateParams(playlistIdSchema), playlistController.getPlaylist);
router.get('/:playlistId/tracks', validateParams(playlistIdSchema), playlistController.getPlaylistTracks);
router.get('/:playlistId/stats', validateParams(playlistIdSchema), playlistController.getPlaylistStats);
router.post('/:playlistId/play', validateParams(playlistIdSchema), playlistController.playPlaylist);

// Protected routes
router.use(authMiddleware);

// Playlist CRUD
router.post('/', validate(createPlaylistSchema), playlistController.createPlaylist);
router.put('/:playlistId', validateParams(playlistIdSchema), validate(updatePlaylistSchema), playlistController.updatePlaylist);
router.delete('/:playlistId', validateParams(playlistIdSchema), playlistController.deletePlaylist);

// User playlists
router.get('/user/:userId', validateParams(userIdSchema), playlistController.getUserPlaylists);
router.get('/user/me', playlistController.getUserPlaylists);

// Track management
router.post('/:playlistId/tracks', validateParams(playlistIdSchema), validate(addTrackSchema), playlistController.addTrackToPlaylist);
router.delete('/:playlistId/tracks', validateParams(playlistIdSchema), validate(removeTrackSchema), playlistController.removeTrackFromPlaylist);
router.put('/:playlistId/tracks/reorder', validateParams(playlistIdSchema), validate(reorderTracksSchema), playlistController.reorderPlaylistTracks);

// Social actions
router.post('/:playlistId/like', validateParams(playlistIdSchema), playlistController.likePlaylist);
router.delete('/:playlistId/like', validateParams(playlistIdSchema), playlistController.unlikePlaylist);
router.post('/:playlistId/share', validateParams(playlistIdSchema), playlistController.sharePlaylist);

// Playlist operations
router.post('/:playlistId/duplicate', validateParams(playlistIdSchema), validate(duplicatePlaylistSchema), playlistController.duplicatePlaylist);

export default router;