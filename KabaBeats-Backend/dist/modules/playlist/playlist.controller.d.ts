import { Response, NextFunction } from 'express';
import { IPlaylistController, PlaylistRequest } from './playlist.interface';
export declare class PlaylistController implements IPlaylistController {
    private playlistService;
    constructor();
    createPlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    getPlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    updatePlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    deletePlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    getUserPlaylists: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    getFeaturedPlaylists: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    getTrendingPlaylists: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    searchPlaylists: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    addTrackToPlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    removeTrackFromPlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    reorderPlaylistTracks: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    likePlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    unlikePlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    sharePlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    playPlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    getPlaylistTracks: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    duplicatePlaylist: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
    getPlaylistStats: (req: PlaylistRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=playlist.controller.d.ts.map