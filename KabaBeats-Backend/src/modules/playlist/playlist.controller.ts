import { Response, NextFunction } from 'express';
import { PlaylistService } from './playlist.service';
import { IPlaylistController, PlaylistRequest } from './playlist.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

export class PlaylistController implements IPlaylistController {
  private playlistService: PlaylistService;

  constructor() {
    this.playlistService = new PlaylistService();
  }

  createPlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const playlist = await this.playlistService.createPlaylist(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: playlist,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getPlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      
      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      const playlist = await this.playlistService.getPlaylist(playlistId);
      
      const response: ApiResponse = {
        success: true,
        data: playlist,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updatePlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      const playlist = await this.playlistService.updatePlaylist(playlistId, userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: playlist,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deletePlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      await this.playlistService.deletePlaylist(playlistId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Playlist deleted successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getUserPlaylists = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.userId;
      const isPublic = req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined;
      
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const playlists = await this.playlistService.getUserPlaylists(userId, isPublic);
      
      const response: ApiResponse = {
        success: true,
        data: playlists,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getFeaturedPlaylists = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const playlists = await this.playlistService.getFeaturedPlaylists(limit);
      
      const response: ApiResponse = {
        success: true,
        data: playlists,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTrendingPlaylists = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const playlists = await this.playlistService.getTrendingPlaylists(limit);
      
      const response: ApiResponse = {
        success: true,
        data: playlists,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  searchPlaylists = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query || typeof query !== 'string') {
        throw new CustomError('Search query is required', 400);
      }

      const playlists = await this.playlistService.searchPlaylists(query, limit);
      
      const response: ApiResponse = {
        success: true,
        data: playlists,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  addTrackToPlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const { beatId } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      if (!beatId) {
        throw new CustomError('Beat ID is required', 400);
      }

      await this.playlistService.addTrackToPlaylist(playlistId, userId, beatId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Track added to playlist successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  removeTrackFromPlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const { beatId } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      if (!beatId) {
        throw new CustomError('Beat ID is required', 400);
      }

      await this.playlistService.removeTrackFromPlaylist(playlistId, userId, beatId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Track removed from playlist successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  reorderPlaylistTracks = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const { trackIds } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      if (!trackIds || !Array.isArray(trackIds)) {
        throw new CustomError('Track IDs array is required', 400);
      }

      await this.playlistService.reorderPlaylistTracks(playlistId, userId, trackIds);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Playlist tracks reordered successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  likePlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      await this.playlistService.likePlaylist(playlistId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Playlist liked successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  unlikePlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      await this.playlistService.unlikePlaylist(playlistId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Playlist unliked successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  sharePlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      await this.playlistService.sharePlaylist(playlistId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Playlist shared successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  playPlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      
      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      await this.playlistService.playPlaylist(playlistId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Playlist played successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getPlaylistTracks = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      
      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      const tracks = await this.playlistService.getPlaylistTracks(playlistId);
      
      const response: ApiResponse = {
        success: true,
        data: tracks,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  duplicatePlaylist = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      const { newTitle } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      const playlist = await this.playlistService.duplicatePlaylist(playlistId, userId, newTitle);
      
      const response: ApiResponse = {
        success: true,
        data: playlist,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getPlaylistStats = async (req: PlaylistRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playlistId } = req.params;
      
      if (!playlistId) {
        throw new CustomError('Playlist ID is required', 400);
      }

      const stats = await this.playlistService.getPlaylistStats(playlistId);
      
      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
