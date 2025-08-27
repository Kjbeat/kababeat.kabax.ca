import { Beat, BeatFormData, BeatFilter } from '@/core/types/beat';
import { CursorPage, Sort } from '@/core/types/shared';

export interface BeatService {
  // CRUD operations
  create(input: BeatFormData, userId: string): Promise<Beat>;
  get(id: string): Promise<Beat>;
  list(filter?: BeatFilter, sort?: Sort, cursor?: string, limit?: number): Promise<CursorPage<Beat>>;
  update(id: string, input: Partial<BeatFormData>, userId: string): Promise<Beat>;
  remove(id: string, userId: string): Promise<void>;
  
  // User beats
  getUserBeats(userId: string, filter?: BeatFilter): Promise<Beat[]>;
  
  // Publishing
  publish(id: string, userId: string): Promise<Beat>;
  unpublish(id: string, userId: string): Promise<Beat>;
  
  // Analytics
  incrementPlayCount(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;
}

