import { Request } from 'express';
import { AuthRequest } from '@/modules/auth/auth.interface';

// Media service interfaces
export interface IMediaService {
  initializeChunkedUpload(options: ChunkedUploadOptions): Promise<ChunkedUploadResult>;
  completeChunkedUpload(uploadId: string, metadata: any, processingOptions?: AudioProcessingOptions): Promise<ProcessingResult>;
  getUploadStatus(uploadId: string): UploadSession | null;
  generateStreamingUrls(beatId: string): Promise<StreamingUrls>;
  generateArtworkUrls(beatId: string): Promise<ArtworkUrls>;
  deleteFile(key: string): Promise<void>;
  getFileInfo(key: string): Promise<FileInfo>;
}

// Media controller interfaces
export interface IMediaController {
  initializeChunkedUpload(req: AuthRequest, res: any, next: any): Promise<void>;
  completeChunkedUpload(req: AuthRequest, res: any, next: any): Promise<void>;
  getUploadStatus(req: AuthRequest, res: any, next: any): Promise<void>;
  generateStreamingUrls(req: AuthRequest, res: any, next: any): Promise<void>;
  generateArtworkUrls(req: AuthRequest, res: any, next: any): Promise<void>;
  deleteFile(req: AuthRequest, res: any, next: any): Promise<void>;
  getFileInfo(req: AuthRequest, res: any, next: any): Promise<void>;
  generateUploadUrl(req: AuthRequest, res: any, next: any): Promise<void>;
  generateDownloadUrl(req: AuthRequest, res: any, next: any): Promise<void>;
}

// Upload interfaces
export interface UploadOptions {
  type: 'audio' | 'image';
  filename: string;
  contentType: string;
  size: number;
  userId: string;
}

export interface ChunkedUploadOptions extends UploadOptions {
  totalChunks: number;
  chunkSize: number;
}

export interface ChunkedUploadResult {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  uploadUrls: string[];
}

// Processing interfaces
export interface AudioProcessingOptions {
  generateWaveform?: boolean;
  extractMetadata?: boolean;
  createPreviews?: boolean;
  generateMultipleQualities?: boolean;
}

export interface ProcessingResult {
  beatId: string;
  streamingUrls: StreamingUrls;
  artworkUrls?: ArtworkUrls;
}

// Streaming interfaces
export interface StreamingUrls {
  preview: string;
  low: string;
  medium: string;
  high: string;
  hls: string;
}

export interface ArtworkUrls {
  mini: string;
  small: string;
  medium: string;
  large: string;
}

// Session interfaces
export interface UploadSession {
  uploadId: string;
  userId: string;
  filename: string;
  contentType: string;
  totalChunks: number;
  uploadedChunks: number[];
  status: 'initialized' | 'uploading' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
}

// File interfaces
export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
}

// Audio metadata interfaces
export interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  codec: string;
  bpm?: number;
  key?: string;
  genre?: string;
}

// Image metadata interfaces
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace: string;
  hasAlpha: boolean;
  fileSize: number;
}

// HLS interfaces
export interface HLSPlaylist {
  master: string;
  qualities: {
    low: string;
    medium: string;
    high: string;
  };
}

// Upload progress interfaces
export interface UploadProgress {
  uploadId: string;
  totalChunks: number;
  uploadedChunks: number;
  progress: number;
  status: string;
}

// Error interfaces
export interface MediaError {
  code: string;
  message: string;
  details?: any;
}

// Configuration interfaces
export interface MediaConfig {
  maxFileSize: {
    audio: number;
    image: number;
  };
  allowedTypes: {
    audio: string[];
    image: string[];
  };
  chunkSize: number;
  processingTimeout: number;
  cleanupInterval: number;
}

// Quality settings interfaces
export interface QualitySettings {
  preview: {
    duration: number;
    bitrate: string;
  };
  low: {
    bitrate: string;
    channels: number;
  };
  medium: {
    bitrate: string;
    channels: number;
  };
  high: {
    format: string;
    quality: string;
  };
}

// Image size settings interfaces
export interface ImageSizeSettings {
  mini: {
    width: number;
    height: number;
    quality: number;
  };
  small: {
    width: number;
    height: number;
    quality: number;
  };
  medium: {
    width: number;
    height: number;
    quality: number;
  };
  large: {
    width: number;
    height: number;
    quality: number;
  };
}
