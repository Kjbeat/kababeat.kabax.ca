import { Playlist, IPlaylist } from './playlist.model';
import { IPlaylistService, CreatePlaylistData, UpdatePlaylistData, PlaylistStats, PlaylistWithTracks } from './playlist.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { UserProfile } from '../user/user.model';
import { Beat } from '../beat/beat.model';

export class PlaylistService implements IPlaylistService {
  async createPlaylist(userId: string, data: CreatePlaylistData): Promise<IPlaylist> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const playlist = new Playlist({
        ...data,
        curator: userId,
        curatorName: (user as any).displayName || user.username,
        curatorAvatar: user.avatar,
        tracks: [],
        trackCount: 0,
      });

      await playlist.save();
      logger.info(`Playlist created: ${playlist.title} by ${user.username}`);

      return playlist;
    } catch (error) {
      logger.error('Create playlist error:', error);
      throw error;
    }
  }

  async getPlaylist(playlistId: string): Promise<IPlaylist> {
    try {
      const playlist = await Playlist.findById(playlistId)
        .populate('curator', 'username firstName lastName avatar isVerified');

      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      return playlist;
    } catch (error) {
      logger.error('Get playlist error:', error);
      throw error;
    }
  }

  async updatePlaylist(playlistId: string, userId: string, data: UpdatePlaylistData): Promise<IPlaylist> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      if (playlist.curator.toString() !== userId) {
        throw new CustomError('Not authorized to update this playlist', 403);
      }

      // Update allowed fields
      const allowedFields = [
        'title', 'description', 'coverImage', 'isPublic', 
        'tags', 'genre', 'mood'
      ];

      allowedFields.forEach(field => {
        if (data[field as keyof UpdatePlaylistData] !== undefined) {
          (playlist as any)[field] = data[field as keyof UpdatePlaylistData];
        }
      });

      await playlist.save();
      logger.info(`Playlist updated: ${playlist.title}`);

      return playlist;
    } catch (error) {
      logger.error('Update playlist error:', error);
      throw error;
    }
  }

  async deletePlaylist(playlistId: string, userId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      if (playlist.curator.toString() !== userId) {
        throw new CustomError('Not authorized to delete this playlist', 403);
      }

      await Playlist.findByIdAndDelete(playlistId);
      logger.info(`Playlist deleted: ${playlist.title}`);
    } catch (error) {
      logger.error('Delete playlist error:', error);
      throw error;
    }
  }

  async getUserPlaylists(userId: string, isPublic?: boolean): Promise<IPlaylist[]> {
    try {
      const query: any = { curator: userId };
      if (isPublic !== undefined) {
        query.isPublic = isPublic;
      }

      const playlists = await Playlist.find(query)
        .sort({ updatedAt: -1 });

      return playlists;
    } catch (error) {
      logger.error('Get user playlists error:', error);
      throw error;
    }
  }

  async getFeaturedPlaylists(limit: number = 10): Promise<IPlaylist[]> {
    try {
      const playlists = await (Playlist as any).findFeatured(limit);
      return playlists;
    } catch (error) {
      logger.error('Get featured playlists error:', error);
      throw error;
    }
  }

  async getTrendingPlaylists(limit: number = 20): Promise<IPlaylist[]> {
    try {
      const playlists = await (Playlist as any).findTrending(limit);
      return playlists;
    } catch (error) {
      logger.error('Get trending playlists error:', error);
      throw error;
    }
  }

  async searchPlaylists(query: string, limit: number = 20): Promise<IPlaylist[]> {
    try {
      const playlists = await (Playlist as any).searchPlaylists(query, limit);
      return playlists;
    } catch (error) {
      logger.error('Search playlists error:', error);
      throw error;
    }
  }

  async addTrackToPlaylist(playlistId: string, userId: string, beatId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      if (playlist.curator.toString() !== userId) {
        throw new CustomError('Not authorized to modify this playlist', 403);
      }

      const beat = await Beat.findById(beatId);
      if (!beat) {
        throw new CustomError('Beat not found', 404);
      }

      await (playlist as any).addTrack(beatId);
      logger.info(`Track added to playlist: ${beat.title} -> ${playlist.title}`);
    } catch (error) {
      logger.error('Add track to playlist error:', error);
      throw error;
    }
  }

  async removeTrackFromPlaylist(playlistId: string, userId: string, beatId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      if (playlist.curator.toString() !== userId) {
        throw new CustomError('Not authorized to modify this playlist', 403);
      }

      await (playlist as any).removeTrack(beatId);
      logger.info(`Track removed from playlist: ${beatId} -> ${playlist.title}`);
    } catch (error) {
      logger.error('Remove track from playlist error:', error);
      throw error;
    }
  }

  async reorderPlaylistTracks(playlistId: string, userId: string, trackIds: string[]): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      if (playlist.curator.toString() !== userId) {
        throw new CustomError('Not authorized to modify this playlist', 403);
      }

      await (playlist as any).reorderTracks(trackIds);
      logger.info(`Playlist tracks reordered: ${playlist.title}`);
    } catch (error) {
      logger.error('Reorder playlist tracks error:', error);
      throw error;
    }
  }

  async likePlaylist(playlistId: string, userId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      // TODO: Implement user likes tracking
      await (playlist as any).incrementLikes();
      logger.info(`Playlist liked: ${playlist.title} by user ${userId}`);
    } catch (error) {
      logger.error('Like playlist error:', error);
      throw error;
    }
  }

  async unlikePlaylist(playlistId: string, userId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      // TODO: Implement user likes tracking
      await (playlist as any).incrementLikes(-1);
      logger.info(`Playlist unliked: ${playlist.title} by user ${userId}`);
    } catch (error) {
      logger.error('Unlike playlist error:', error);
      throw error;
    }
  }

  async sharePlaylist(playlistId: string, userId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      await (playlist as any).incrementShares();
      logger.info(`Playlist shared: ${playlist.title} by user ${userId}`);
    } catch (error) {
      logger.error('Share playlist error:', error);
      throw error;
    }
  }

  async playPlaylist(playlistId: string): Promise<void> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      await (playlist as any).incrementPlays();
      logger.info(`Playlist played: ${playlist.title}`);
    } catch (error) {
      logger.error('Play playlist error:', error);
      throw error;
    }
  }

  async getPlaylistTracks(playlistId: string): Promise<any[]> {
    try {
      const playlist = await Playlist.findById(playlistId)
        .populate({
          path: 'tracks',
          model: 'Beat',
          select: 'title producer artwork bpm key genre mood price duration isLiked'
        });

      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      return playlist.tracks;
    } catch (error) {
      logger.error('Get playlist tracks error:', error);
      throw error;
    }
  }

  async duplicatePlaylist(playlistId: string, userId: string, newTitle?: string): Promise<IPlaylist> {
    try {
      const originalPlaylist = await Playlist.findById(playlistId);
      if (!originalPlaylist) {
        throw new CustomError('Playlist not found', 404);
      }

      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const duplicatedPlaylist = new Playlist({
        title: newTitle || `${originalPlaylist.title} (Copy)`,
        description: originalPlaylist.description,
        coverImage: originalPlaylist.coverImage,
        isPublic: false, // Duplicated playlists are private by default
        curator: userId,
        curatorName: (user as any).displayName || user.username,
        curatorAvatar: user.avatar,
        tracks: [...originalPlaylist.tracks],
        trackCount: originalPlaylist.trackCount,
        tags: [...originalPlaylist.tags],
        genre: originalPlaylist.genre,
        mood: originalPlaylist.mood,
      });

      await duplicatedPlaylist.save();
      logger.info(`Playlist duplicated: ${originalPlaylist.title} -> ${duplicatedPlaylist.title}`);

      return duplicatedPlaylist;
    } catch (error) {
      logger.error('Duplicate playlist error:', error);
      throw error;
    }
  }

  async getPlaylistStats(playlistId: string): Promise<PlaylistStats> {
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        throw new CustomError('Playlist not found', 404);
      }

      return {
        totalPlays: playlist.totalPlays,
        totalLikes: playlist.totalLikes,
        totalShares: playlist.totalShares,
        trackCount: playlist.trackCount,
        duration: 0, // TODO: Calculate from tracks
        ...(playlist.lastPlayedAt && { lastPlayedAt: playlist.lastPlayedAt }),
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      };
    } catch (error) {
      logger.error('Get playlist stats error:', error);
      throw error;
    }
  }
}
