export declare const resolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<import("../modules/user/user.model").IUserProfile | null>;
        user: (_: any, { id }: {
            id: string;
        }) => Promise<import("../modules/user/user.model").IUserProfile>;
        users: (_: any, { search, limit, offset }: {
            search?: string;
            limit?: number;
            offset?: number;
        }) => Promise<import("../modules/user/user.model").IUserProfile[]>;
        topProducers: (_: any, { limit }: {
            limit?: number;
        }) => Promise<import("../modules/user/user.model").IUserProfile[]>;
        beats: (_: any, { search, genre, bpm, limit, offset }: {
            search?: string;
            genre?: string;
            bpm?: number;
            limit?: number;
            offset?: number;
        }) => Promise<any>;
        beat: (_: any, { id }: {
            id: string;
        }) => Promise<any>;
        beatsByProducer: (_: any, { producerId, limit, offset }: {
            producerId: string;
            limit?: number;
            offset?: number;
        }) => Promise<any>;
        featuredBeats: (_: any, { limit }: {
            limit?: number;
        }) => Promise<import("../types").IBeat[]>;
        trendingBeats: (_: any, { limit }: {
            limit?: number;
        }) => Promise<import("../types").IBeat[]>;
        playlists: (_: any, { search, limit, offset }: {
            search?: string;
            limit?: number;
            offset?: number;
        }) => Promise<import("@/modules/playlist/playlist.model").IPlaylist[]>;
        playlist: (_: any, { id }: {
            id: string;
        }) => Promise<import("@/modules/playlist/playlist.model").IPlaylist>;
        userPlaylists: (_: any, { userId, isPublic }: {
            userId: string;
            isPublic?: boolean;
        }) => Promise<import("@/modules/playlist/playlist.model").IPlaylist[]>;
        featuredPlaylists: (_: any, { limit }: {
            limit?: number;
        }) => Promise<import("@/modules/playlist/playlist.model").IPlaylist[]>;
        trendingPlaylists: (_: any, { limit }: {
            limit?: number;
        }) => Promise<import("@/modules/playlist/playlist.model").IPlaylist[]>;
    };
    Mutation: {
        login: (_: any, { input }: {
            input: {
                email: string;
                password: string;
            };
        }) => Promise<import("../modules/auth").AuthResponse>;
        register: (_: any, { input }: {
            input: {
                email: string;
                username: string;
                password: string;
                firstName?: string;
                lastName?: string;
                country?: string;
            };
        }) => Promise<import("../modules/auth").AuthResponse>;
        refreshToken: (_: any, { refreshToken }: {
            refreshToken: string;
        }) => Promise<import("../modules/auth").AuthResponse>;
        logout: (_: any, __: any, context: any) => Promise<boolean>;
        updateProfile: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("../modules/user/user.model").IUserProfile>;
        followUser: (_: any, { userId }: {
            userId: string;
        }, context: any) => Promise<boolean>;
        unfollowUser: (_: any, { userId }: {
            userId: string;
        }, context: any) => Promise<boolean>;
        createBeat: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("../types").IBeat>;
        updateBeat: (_: any, { id, input }: {
            id: string;
            input: any;
        }, context: any) => Promise<import("../types").IBeat>;
        deleteBeat: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        likeBeat: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        unlikeBeat: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        createPlaylist: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("@/modules/playlist/playlist.model").IPlaylist>;
        updatePlaylist: (_: any, { id, input }: {
            id: string;
            input: any;
        }, context: any) => Promise<import("@/modules/playlist/playlist.model").IPlaylist>;
        deletePlaylist: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        addTrackToPlaylist: (_: any, { playlistId, beatId }: {
            playlistId: string;
            beatId: string;
        }, context: any) => Promise<boolean>;
        removeTrackFromPlaylist: (_: any, { playlistId, beatId }: {
            playlistId: string;
            beatId: string;
        }, context: any) => Promise<boolean>;
        likePlaylist: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        unlikePlaylist: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
    };
};
//# sourceMappingURL=resolvers.d.ts.map