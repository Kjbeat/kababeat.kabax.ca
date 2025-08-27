import { Range } from '../types/shared';

export interface StorageService {
  // File upload
  uploadFile(file: File, path: string): Promise<string>; // Returns URL
  uploadAudio(file: File, userId: string): Promise<string>;
  uploadArtwork(file: File, userId: string): Promise<string>;
  
  // File download
  getDownloadUrl(path: string): Promise<string>;
  getAudioUrl(beatId: string): Promise<string>;
  getArtworkUrl(beatId: string): Promise<string>;
  
  // File management
  deleteFile(path: string): Promise<void>;
  getFileSize(path: string): Promise<number>;
  
  // Streaming
  getStreamingUrl(path: string, range?: Range): Promise<string>;
}

