import { Request } from 'express';
import { IPlaylist } from './playlist.model';
import { JwtPayload } from '@/utils/auth';
export interface PlaylistRequest extends Request {
    user?: JwtPayload;
}
export interface IPlaylistService {
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
export interface IPlaylistController {
    createPlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    getPlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    updatePlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    deletePlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    getUserPlaylists(req: PlaylistRequest, res: any, next: any): Promise<void>;
    getFeaturedPlaylists(req: PlaylistRequest, res: any, next: any): Promise<void>;
    getTrendingPlaylists(req: PlaylistRequest, res: any, next: any): Promise<void>;
    searchPlaylists(req: PlaylistRequest, res: any, next: any): Promise<void>;
    addTrackToPlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    removeTrackFromPlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    reorderPlaylistTracks(req: PlaylistRequest, res: any, next: any): Promise<void>;
    likePlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    unlikePlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    sharePlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    playPlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    getPlaylistTracks(req: PlaylistRequest, res: any, next: any): Promise<void>;
    duplicatePlaylist(req: PlaylistRequest, res: any, next: any): Promise<void>;
    getPlaylistStats(req: PlaylistRequest, res: any, next: any): Promise<void>;
}
export interface CreatePlaylistData {
    title: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
    tags?: string[];
    genre?: string;
    mood?: string;
}
export interface UpdatePlaylistData {
    title?: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
    tags?: string[];
    genre?: string;
    mood?: string;
}
export interface AddTrackRequest {
    beatId: string;
}
export interface RemoveTrackRequest {
    beatId: string;
}
export interface ReorderTracksRequest {
    trackIds: string[];
}
export interface DuplicatePlaylistRequest {
    newTitle?: string;
}
export interface PlaylistStats {
    totalPlays: number;
    totalLikes: number;
    totalShares: number;
    trackCount: number;
    duration: number;
    lastPlayedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface PlaylistWithTracks extends IPlaylist {
    tracks: any[];
}
export interface PlaylistListResponse {
    playlists: IPlaylist[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export interface FrontendPlaylist {
    id: string;
    title: string;
    description: string;
    coverImage?: string;
    isPublic: boolean;
    trackCount: number;
    updatedAt: string;
    curator: string;
    curatorName: string;
    curatorAvatar?: string;
    tags: string[];
    genre?: string;
    mood?: string;
    totalPlays: number;
    totalLikes: number;
    totalShares: number;
    isFeatured: boolean;
    isCurated: boolean;
    tracks?: any[];
}
export interface PlaylistFilters {
    genre?: string;
    mood?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    isCurated?: boolean;
    curator?: string;
    tags?: string[];
    sortBy?: 'recent' | 'popular' | 'trending' | 'title';
    sortOrder?: 'asc' | 'desc';
}
export interface PlaylistSearchParams {
    query?: string;
    filters?: PlaylistFilters;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=playlist.interface.d.ts.map