import { StorageService } from '../../core/services/StorageService';
import { Range } from '../../core/types/shared';

export class StorageServiceMongo implements StorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async uploadAudio(file: File, userId: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async uploadArtwork(file: File, userId: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getDownloadUrl(path: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getAudioUrl(beatId: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getArtworkUrl(beatId: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async deleteFile(path: string): Promise<void> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getFileSize(path: string): Promise<number> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getStreamingUrl(path: string, range?: Range): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }
}
