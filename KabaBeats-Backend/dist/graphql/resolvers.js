"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const auth_service_1 = require("@/modules/auth/auth.service");
const beat_service_1 = require("@/modules/beat/beat.service");
const playlist_service_1 = require("@/modules/playlist/playlist.service");
const user_service_1 = require("@/modules/user/user.service");
const auth_1 = require("@/utils/auth");
const authService = new auth_service_1.AuthService();
const beatService = new beat_service_1.BeatService();
const playlistService = new playlist_service_1.PlaylistService();
const userService = new user_service_1.UserService();
const getUserFromContext = (context) => {
    const token = context.req?.headers?.authorization?.replace('Bearer ', '');
    if (!token)
        return null;
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.resolvers = {
    Query: {
        me: async (_, __, context) => {
            const user = getUserFromContext(context);
            if (!user)
                return null;
            return await userService.getProfile(user.userId);
        },
        user: async (_, { id }) => {
            return await userService.getProfile(id);
        },
        users: async (_, { search, limit = 20, offset = 0 }) => {
            if (search) {
                const result = await userService.searchUsers(search, Math.floor(offset / limit) + 1, limit);
                return result.users;
            }
            return await userService.getRecentUsers(limit);
        },
        topProducers: async (_, { limit = 20 }) => {
            return await userService.getTopProducers(limit);
        },
        beats: async (_, { search, genre, bpm, limit = 20, offset = 0 }) => {
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
        beat: async (_, { id }) => {
            return await beatService.getBeat(id);
        },
        beatsByProducer: async (_, { producerId, limit = 20, offset = 0 }) => {
            const result = await beatService.getBeatsByProducer(producerId, {
                pagination: { page: Math.floor(offset / limit) + 1, limit }
            });
            return result.beats;
        },
        featuredBeats: async (_, { limit = 20 }) => {
            return await beatService.getFeaturedBeats(limit);
        },
        trendingBeats: async (_, { limit = 20 }) => {
            return await beatService.getTrendingBeats(limit);
        },
        playlists: async (_, { search, limit = 20, offset = 0 }) => {
            if (search) {
                return await playlistService.searchPlaylists(search, limit);
            }
            const result = await playlistService.getFeaturedPlaylists(limit);
            return result;
        },
        playlist: async (_, { id }) => {
            return await playlistService.getPlaylist(id);
        },
        userPlaylists: async (_, { userId, isPublic }) => {
            return await playlistService.getUserPlaylists(userId, isPublic);
        },
        featuredPlaylists: async (_, { limit = 10 }) => {
            return await playlistService.getFeaturedPlaylists(limit);
        },
        trendingPlaylists: async (_, { limit = 20 }) => {
            return await playlistService.getTrendingPlaylists(limit);
        },
    },
    Mutation: {
        login: async (_, { input }) => {
            return await authService.login(input);
        },
        register: async (_, { input }) => {
            return await authService.register(input);
        },
        refreshToken: async (_, { refreshToken }) => {
            return await authService.refreshToken(refreshToken);
        },
        logout: async (_, __, context) => {
            const user = getUserFromContext(context);
            if (!user)
                return false;
            await authService.logout(user.userId, context.req.body.refreshToken);
            return true;
        },
        updateProfile: async (_, { input }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            return await userService.updateProfile(user.userId, input);
        },
        followUser: async (_, { userId }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await userService.followUser(user.userId, userId);
            return true;
        },
        unfollowUser: async (_, { userId }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await userService.unfollowUser(user.userId, userId);
            return true;
        },
        createBeat: async (_, { input }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            return await beatService.createBeat(user.userId, input);
        },
        updateBeat: async (_, { id, input }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            return await beatService.updateBeat(id, user.userId, input);
        },
        deleteBeat: async (_, { id }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await beatService.deleteBeat(id, user.userId);
            return true;
        },
        likeBeat: async (_, { id }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await beatService.likeBeat(id, user.userId);
            return true;
        },
        unlikeBeat: async (_, { id }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await beatService.unlikeBeat(id, user.userId);
            return true;
        },
        createPlaylist: async (_, { input }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            return await playlistService.createPlaylist(user.userId, input);
        },
        updatePlaylist: async (_, { id, input }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            return await playlistService.updatePlaylist(id, user.userId, input);
        },
        deletePlaylist: async (_, { id }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await playlistService.deletePlaylist(id, user.userId);
            return true;
        },
        addTrackToPlaylist: async (_, { playlistId, beatId }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await playlistService.addTrackToPlaylist(playlistId, user.userId, beatId);
            return true;
        },
        removeTrackFromPlaylist: async (_, { playlistId, beatId }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await playlistService.removeTrackFromPlaylist(playlistId, user.userId, beatId);
            return true;
        },
        likePlaylist: async (_, { id }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await playlistService.likePlaylist(id, user.userId);
            return true;
        },
        unlikePlaylist: async (_, { id }, context) => {
            const user = getUserFromContext(context);
            if (!user)
                throw new Error('Not authenticated');
            await playlistService.unlikePlaylist(id, user.userId);
            return true;
        },
    },
};
//# sourceMappingURL=resolvers.js.map