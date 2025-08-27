import { Playlist, PlaylistInput, PlaylistFilter } from '@/core/types/playlist';
import { CursorPage, Sort } from '@/core/types/shared';

export interface PlaylistService {
  // CRUD operations
  create(input: PlaylistInput, userId: string): Promise<Playlist>;
  get(id: string, userId?: string): Promise<Playlist>;
  list(filter?: PlaylistFilter, sort?: Sort, cursor?: string, limit?: number): Promise<CursorPage<Playlist>>;
  update(id: string, input: Partial<PlaylistInput>, userId: string): Promise<Playlist>;
  remove(id: string, userId: string): Promise<void>;
  
  // Playlist items
  addItem(playlistId: string, beatId: string, userId: string): Promise<void>;
  removeItem(playlistId: string, beatId: string, userId: string): Promise<void>;
  reorderItems(playlistId: string, itemIds: string[], userId: string): Promise<void>;
  
  // User playlists
  getUserPlaylists(userId: string, filter?: PlaylistFilter): Promise<Playlist[]>;
  
  // Sharing
  share(id: string, userId: string): Promise<string>;
}

