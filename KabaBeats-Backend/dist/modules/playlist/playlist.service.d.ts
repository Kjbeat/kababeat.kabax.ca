import { IPlaylist } from './playlist.model';
import { IPlaylistService, CreatePlaylistData, UpdatePlaylistData, PlaylistStats } from './playlist.interface';
export declare class PlaylistService implements IPlaylistService {
    createPlaylist(userId: string, data: CreatePlaylistData): Promise<IPlaylist>;
    getPlaylist(playlistId: string): Promise<IPlaylist>;
    updatePlaylist(playlistId: string, userId: string, data: UpdatePlaylistData): Promise<IPlaylist>;
    deletePlaylist(playlistId: string, userId: string): Promise<void>;
    getUserPlaylists(userId: string, isPublic?: boolean): Promise<IPlaylist[]>;
    getFeaturedPlaylists(limit?: number): Promise<IPlaylist[]>;
    getTrendingPlaylists(limit?: number): Promise<IPlaylist[]>;
    searchPlaylists(query: string, limit?: number): Promise<IPlaylist[]>;
    addTrackToPlaylist(playlistId: string, userId: string, beatId: string): Promise<void>;
    removeTrackFromPlaylist(playlistId: string, userId: string, beatId: string): Promise<void>;
    reorderPlaylistTracks(playlistId: string, userId: string, trackIds: string[]): Promise<void>;
    likePlaylist(playlistId: string, userId: string): Promise<void>;
    unlikePlaylist(playlistId: string, userId: string): Promise<void>;
    sharePlaylist(playlistId: string, userId: string): Promise<void>;
    playPlaylist(playlistId: string): Promise<void>;
    getPlaylistTracks(playlistId: string): Promise<any[]>;
    duplicatePlaylist(playlistId: string, userId: string, newTitle?: string): Promise<IPlaylist>;
    getPlaylistStats(playlistId: string): Promise<PlaylistStats>;
}
//# sourceMappingURL=playlist.service.d.ts.map