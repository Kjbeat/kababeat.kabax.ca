import { User } from '@/modules/auth/auth.model';
import { Beat } from '@/modules/beat/beat.model';
import { Playlist } from '@/modules/playlist/playlist.model';
import { AuthService } from '@/modules/auth/auth.service';
import { BeatService } from '@/modules/beat/beat.service';
import { PlaylistService } from '@/modules/playlist/playlist.service';
import { UserService } from '@/modules/user/user.service';
import { verifyToken } from '@/utils/auth';

// Initialize services
const authService = new AuthService();
const beatService = new BeatService();
const playlistService = new PlaylistService();
const userService = new UserService();

// Helper function to get user from context
const getUserFromContext = (context: any) => {
  const token = context.req?.headers?.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const resolvers = {
  Query: {
    // User queries
    me: async (_: any, __: any, context: any) => {
      const user = getUserFromContext(context);
      if (!user) return null;
      
      return await userService.getProfile(user.userId);
    },

    user: async (_: any, { id }: { id: string }) => {
      return await userService.getProfile(id);
    },

    users: async (_: any, { search, limit = 20, offset = 0 }: { search?: string; limit?: number; offset?: number }) => {
      if (search) {
        const result = await userService.searchUsers(search, Math.floor(offset / limit) + 1, limit);
        return result.users;
      }
      return await userService.getRecentUsers(limit);
    },

    topProducers: async (_: any, { limit = 20 }: { limit?: number }) => {
      return await userService.getTopProducers(limit);
    },

    // Beat queries
    beats: async (_: any, { search, genre, bpm, limit = 20, offset = 0 }: { 
      search?: string; 
      genre?: string; 
      bpm?: number; 
      limit?: number; 
      offset?: number 
    }) => {
      if (search) {
        const result = await beatService.searchBeats(search, {
          pagination: { page: Math.floor(offset / limit) + 1, limit },
          query: search,
          filters: { genre, bpm }
        });
        return result.beats;
      }
      
      const result = await beatService.getBeats({
        pagination: { page: Math.floor(offset / limit) + 1, limit },
        filters: { genre, bpm }
      });
      return result.beats;
    },

    beat: async (_: any, { id }: { id: string }) => {
      return await beatService.getBeat(id);
    },

    beatsByProducer: async (_: any, { producerId, limit = 20, offset = 0 }: { 
      producerId: string; 
      limit?: number; 
      offset?: number 
    }) => {
      const result = await beatService.getBeatsByProducer(producerId, {
        pagination: { page: Math.floor(offset / limit) + 1, limit }
      });
      return result.beats;
    },

    featuredBeats: async (_: any, { limit = 20 }: { limit?: number }) => {
      return await beatService.getFeaturedBeats(limit);
    },

    trendingBeats: async (_: any, { limit = 20 }: { limit?: number }) => {
      return await beatService.getTrendingBeats(limit);
    },

    // Playlist queries
    playlists: async (_: any, { search, limit = 20, offset = 0 }: { 
      search?: string; 
      limit?: number; 
      offset?: number 
    }) => {
      if (search) {
        return await playlistService.searchPlaylists(search, limit);
      }
      
      const result = await playlistService.getFeaturedPlaylists(limit);
      return result;
    },

    playlist: async (_: any, { id }: { id: string }) => {
      return await playlistService.getPlaylist(id);
    },

    userPlaylists: async (_: any, { userId, isPublic }: { userId: string; isPublic?: boolean }) => {
      return await playlistService.getUserPlaylists(userId, isPublic);
    },

    featuredPlaylists: async (_: any, { limit = 10 }: { limit?: number }) => {
      return await playlistService.getFeaturedPlaylists(limit);
    },

    trendingPlaylists: async (_: any, { limit = 20 }: { limit?: number }) => {
      return await playlistService.getTrendingPlaylists(limit);
    },
  },

  Mutation: {
    // Auth mutations
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      return await authService.login(input);
    },

    register: async (_: any, { input }: { 
      input: { 
        email: string; 
        username: string; 
        password: string; 
        firstName?: string; 
        lastName?: string; 
        country?: string; 
      } 
    }) => {
      return await authService.register(input);
    },

    refreshToken: async (_: any, { refreshToken }: { refreshToken: string }) => {
      return await authService.refreshToken(refreshToken);
    },

    logout: async (_: any, __: any, context: any) => {
      const user = getUserFromContext(context);
      if (!user) return false;
      
      await authService.logout(user.userId, context.req.body.refreshToken);
      return true;
    },

    // User mutations
    updateProfile: async (_: any, { input }: { input: any }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      return await userService.updateProfile(user.userId, input);
    },

    followUser: async (_: any, { userId }: { userId: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await userService.followUser(user.userId, userId);
      return true;
    },

    unfollowUser: async (_: any, { userId }: { userId: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await userService.unfollowUser(user.userId, userId);
      return true;
    },

    // Beat mutations
    createBeat: async (_: any, { input }: { input: any }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      return await beatService.createBeat(user.userId, input);
    },

    updateBeat: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      return await beatService.updateBeat(id, user.userId, input);
    },

    deleteBeat: async (_: any, { id }: { id: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await beatService.deleteBeat(id, user.userId);
      return true;
    },

    likeBeat: async (_: any, { id }: { id: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await beatService.likeBeat(id, user.userId);
      return true;
    },

    unlikeBeat: async (_: any, { id }: { id: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await beatService.unlikeBeat(id, user.userId);
      return true;
    },

    // Playlist mutations
    createPlaylist: async (_: any, { input }: { input: any }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      return await playlistService.createPlaylist(user.userId, input);
    },

    updatePlaylist: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      return await playlistService.updatePlaylist(id, user.userId, input);
    },

    deletePlaylist: async (_: any, { id }: { id: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await playlistService.deletePlaylist(id, user.userId);
      return true;
    },

    addTrackToPlaylist: async (_: any, { playlistId, beatId }: { playlistId: string; beatId: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await playlistService.addTrackToPlaylist(playlistId, user.userId, beatId);
      return true;
    },

    removeTrackFromPlaylist: async (_: any, { playlistId, beatId }: { playlistId: string; beatId: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await playlistService.removeTrackFromPlaylist(playlistId, user.userId, beatId);
      return true;
    },

    likePlaylist: async (_: any, { id }: { id: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await playlistService.likePlaylist(id, user.userId);
      return true;
    },

    unlikePlaylist: async (_: any, { id }: { id: string }, context: any) => {
      const user = getUserFromContext(context);
      if (!user) throw new Error('Not authenticated');
      
      await playlistService.unlikePlaylist(id, user.userId);
      return true;
    },
  },
};
