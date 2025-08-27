import { SearchService } from '../../core/services/SearchService';
import { Beat, Playlist, CursorPage } from '../../core/types';

export class SearchServiceMongo implements SearchService {
  async searchBeats(query: string, filters?: any, cursor?: string, limit?: number): Promise<CursorPage<Beat>> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async searchPlaylists(query: string, filters?: any, cursor?: string, limit?: number): Promise<CursorPage<Playlist>> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async searchUsers(query: string, cursor?: string, limit?: number): Promise<CursorPage<any>> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getTrendingBeats(limit?: number): Promise<Beat[]> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getTrendingPlaylists(limit?: number): Promise<Playlist[]> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }
}
