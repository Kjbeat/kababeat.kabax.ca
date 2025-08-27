import { Beat, Playlist, CursorPage } from '../types';

export interface SearchService {
  // Search operations
  searchBeats(query: string, filters?: any, cursor?: string, limit?: number): Promise<CursorPage<Beat>>;
  searchPlaylists(query: string, filters?: any, cursor?: string, limit?: number): Promise<CursorPage<Playlist>>;
  searchUsers(query: string, cursor?: string, limit?: number): Promise<CursorPage<any>>;
  
  // Suggestions
  getSearchSuggestions(query: string): Promise<string[]>;
  
  // Trending
  getTrendingBeats(limit?: number): Promise<Beat[]>;
  getTrendingPlaylists(limit?: number): Promise<Playlist[]>;
}
