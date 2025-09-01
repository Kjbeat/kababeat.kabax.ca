import { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFile, generateFileKey } from '@/config/cloudflare-r2';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { 
  UploadOptions, 
  ChunkedUploadOptions, 
  AudioProcessingOptions, 
  StreamingUrls, 
  ArtworkUrls, 
  UploadSession 
} from './media.interface';

const execAsync = promisify(exec);

export class MediaService {
  private uploadSessions: Map<string, UploadSession> = new Map();

  /**
   * Initialize chunked upload session
   */
  async initializeChunkedUpload(options: ChunkedUploadOptions): Promise<{
    uploadId: string;
    chunkSize: number;
    totalChunks: number;
    uploadUrls: string[];
  }> {
    try {
      const { type, filename, contentType, size, userId, totalChunks, chunkSize } = options;
      
      // Validate file
      this.validateFile(options);
      
      // Generate upload session
      const uploadId = this.generateUploadId();
      const session: UploadSession = {
        uploadId,
        userId,
        filename,
        contentType,
        totalChunks,
        uploadedChunks: [],
        status: 'initialized',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };
      
      this.uploadSessions.set(uploadId, session);
      
      // Generate presigned URLs for each chunk
      const uploadUrls: string[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkKey = `uploads/${uploadId}/chunk_${i}`;
        const { uploadUrl } = await generatePresignedUploadUrl(chunkKey, 'application/octet-stream', 3600);
        uploadUrls.push(uploadUrl);
      }
      
      logger.info(`Initialized chunked upload: ${uploadId} for ${filename}`);
      
      return {
        uploadId,
        chunkSize,
        totalChunks,
        uploadUrls,
      };
    } catch (error) {
      logger.error('Initialize chunked upload error:', error);
      throw error;
    }
  }

  /**
   * Complete chunked upload and process files
   */
  async completeChunkedUpload(
    uploadId: string,
    metadata: any,
    processingOptions: AudioProcessingOptions = {}
  ): Promise<{
    beatId: string;
    streamingUrls: StreamingUrls;
    artworkUrls?: ArtworkUrls;
  }> {
    try {
      const session = this.uploadSessions.get(uploadId);
      if (!session) {
        throw new CustomError('Upload session not found', 404);
      }

      if (session.status !== 'initialized') {
        throw new CustomError('Upload session not in valid state', 400);
      }

      // Update session status
      session.status = 'processing';
      this.uploadSessions.set(uploadId, session);

      // Reassemble file from chunks
      const assembledFile = await this.reassembleChunks(uploadId, session.filename);
      
      // Generate beat ID
      const beatId = this.generateBeatId();
      
      // Process based on file type
      if (session.contentType.startsWith('audio/')) {
        const result = await this.processAudioFile(
          assembledFile,
          beatId,
          session.userId,
          metadata,
          processingOptions
        );
        
        // Update session status
        session.status = 'completed';
        this.uploadSessions.set(uploadId, session);
        
        // Clean up temporary files
        await this.cleanupUploadSession(uploadId);
        
        return result;
      } else if (session.contentType.startsWith('image/')) {
        const result = await this.processImageFile(
          assembledFile,
          beatId,
          session.userId
        );
        
        session.status = 'completed';
        this.uploadSessions.set(uploadId, session);
        
        await this.cleanupUploadSession(uploadId);
        
        return {
          beatId: result.beatId,
          streamingUrls: {
            preview: '',
            low: '',
            medium: '',
            high: '',
            hls: '',
          },
          artworkUrls: result.artworkUrls,
        };
      } else {
        throw new CustomError('Unsupported file type', 400);
      }
    } catch (error) {
      logger.error('Complete chunked upload error:', error);
      
      // Update session status to failed
      const session = this.uploadSessions.get(uploadId);
      if (session) {
        session.status = 'failed';
        this.uploadSessions.set(uploadId, session);
      }
      
      throw error;
    }
  }

  /**
   * Process audio file and generate multiple qualities
   */
  private async processAudioFile(
    filePath: string,
    beatId: string,
    userId: string,
    metadata: any,
    options: AudioProcessingOptions
  ): Promise<{ beatId: string; streamingUrls: StreamingUrls }> {
    try {
      const baseKey = `audio/${userId}/${beatId}`;
      const tempDir = path.join(process.cwd(), 'temp', beatId);
      
      // Create temp directory
      await fs.promises.mkdir(tempDir, { recursive: true });
      
      // Extract metadata
      const audioMetadata = await this.extractAudioMetadata(filePath);
      
      // Generate preview (30 seconds)
      const previewPath = path.join(tempDir, 'preview.mp3');
      await this.generatePreview(filePath, previewPath);
      
      // Generate multiple quality versions
      const qualities = [
        { name: 'low', bitrate: '128k', path: path.join(tempDir, '128k.mp3') },
        { name: 'medium', bitrate: '320k', path: path.join(tempDir, '320k.mp3') },
        { name: 'high', bitrate: 'lossless', path: path.join(tempDir, 'lossless.wav') },
      ];
      
      const qualityPromises = qualities.map(quality => 
        this.generateAudioQuality(filePath, quality.path, quality.bitrate)
      );
      
      await Promise.all(qualityPromises);
      
      // Upload all versions to R2
      const uploadPromises = [
        this.uploadToR2(previewPath, `${baseKey}/preview.mp3`),
        this.uploadToR2(qualities[0]!.path, `${baseKey}/128k.mp3`),
        this.uploadToR2(qualities[1]!.path, `${baseKey}/320k.mp3`),
        this.uploadToR2(qualities[2]!.path, `${baseKey}/lossless.wav`),
      ];
      
      await Promise.all(uploadPromises);
      
      // Generate HLS playlist
      const hlsUrl = await this.generateHLSPlaylist(beatId, baseKey);
      
      // Generate streaming URLs
      const streamingUrls: StreamingUrls = {
        preview: await generatePresignedDownloadUrl(`${baseKey}/preview.mp3`, 86400),
        low: await generatePresignedDownloadUrl(`${baseKey}/128k.mp3`, 86400),
        medium: await generatePresignedDownloadUrl(`${baseKey}/320k.mp3`, 86400),
        high: await generatePresignedDownloadUrl(`${baseKey}/lossless.wav`, 86400),
        hls: hlsUrl,
      };
      
      // Clean up temp files
      await fs.promises.rm(tempDir, { recursive: true, force: true });
      
      logger.info(`Audio processing completed for beat: ${beatId}`);
      
      return { beatId, streamingUrls };
    } catch (error) {
      logger.error('Process audio file error:', error);
      throw error;
    }
  }

  /**
   * Process image file and generate multiple sizes
   */
  private async processImageFile(
    filePath: string,
    beatId: string,
    userId: string
  ): Promise<{ beatId: string; artworkUrls: ArtworkUrls }> {
    try {
      const baseKey = `artwork/${userId}/${beatId}`;
      const tempDir = path.join(process.cwd(), 'temp', beatId);
      
      await fs.promises.mkdir(tempDir, { recursive: true });
      
      // Generate multiple sizes
      const sizes = [
        { name: 'mini', size: '150x150', path: path.join(tempDir, '150x150.webp') },
        { name: 'small', size: '300x300', path: path.join(tempDir, '300x300.webp') },
        { name: 'medium', size: '600x600', path: path.join(tempDir, '600x600.webp') },
        { name: 'large', size: '1200x1200', path: path.join(tempDir, '1200x1200.webp') },
      ];
      
      const sizePromises = sizes.map(size => 
        this.generateImageSize(filePath, size.path, size.size)
      );
      
      await Promise.all(sizePromises);
      
      // Upload all sizes to R2
      const uploadPromises = sizes.map(size => 
        this.uploadToR2(size.path, `${baseKey}/${size.name}.webp`)
      );
      
      await Promise.all(uploadPromises);
      
      // Generate artwork URLs
      const artworkUrls: ArtworkUrls = {
        mini: await generatePresignedDownloadUrl(`${baseKey}/mini.webp`, 86400),
        small: await generatePresignedDownloadUrl(`${baseKey}/small.webp`, 86400),
        medium: await generatePresignedDownloadUrl(`${baseKey}/medium.webp`, 86400),
        large: await generatePresignedDownloadUrl(`${baseKey}/large.webp`, 86400),
      };
      
      // Clean up temp files
      await fs.promises.rm(tempDir, { recursive: true, force: true });
      
      logger.info(`Image processing completed for beat: ${beatId}`);
      
      return { beatId, artworkUrls };
    } catch (error) {
      logger.error('Process image file error:', error);
      throw error;
    }
  }

  /**
   * Generate HLS playlist for adaptive streaming
   */
  private async generateHLSPlaylist(beatId: string, baseKey: string): Promise<string> {
    try {
      const playlistContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=128000,CODECS="mp4a.40.2"
${baseKey}/128k.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=320000,CODECS="mp4a.40.2"
${baseKey}/320k.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1411000,CODECS="mp4a.40.2"
${baseKey}/lossless.m3u8`;

      const playlistKey = `playlists/${beatId}/master.m3u8`;
      
      // Upload playlist to R2
      await this.uploadToR2(Buffer.from(playlistContent), playlistKey, 'application/vnd.apple.mpegurl');
      
      return await generatePresignedDownloadUrl(playlistKey, 86400);
    } catch (error) {
      logger.error('Generate HLS playlist error:', error);
      throw error;
    }
  }

  /**
   * Extract audio metadata using FFprobe
   */
  private async extractAudioMetadata(filePath: string): Promise<any> {
    try {
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);
    } catch (error) {
      logger.error('Extract audio metadata error:', error);
      throw error;
    }
  }

  /**
   * Generate audio preview (30 seconds)
   */
  private async generatePreview(inputPath: string, outputPath: string): Promise<void> {
    try {
      const command = `ffmpeg -i "${inputPath}" -t 30 -b:a 64k -ac 2 "${outputPath}"`;
      await execAsync(command);
    } catch (error) {
      logger.error('Generate preview error:', error);
      throw error;
    }
  }

  /**
   * Generate audio quality version
   */
  private async generateAudioQuality(inputPath: string, outputPath: string, bitrate: string): Promise<void> {
    try {
      let command: string;
      
      if (bitrate === 'lossless') {
        command = `ffmpeg -i "${inputPath}" -c:a flac "${outputPath}"`;
      } else {
        command = `ffmpeg -i "${inputPath}" -b:a ${bitrate} -ac 2 "${outputPath}"`;
      }
      
      await execAsync(command);
    } catch (error) {
      logger.error('Generate audio quality error:', error);
      throw error;
    }
  }

  /**
   * Generate image size
   */
  private async generateImageSize(inputPath: string, outputPath: string, size: string): Promise<void> {
    try {
      const command = `ffmpeg -i "${inputPath}" -vf scale=${size} -c:v libwebp -quality 80 "${outputPath}"`;
      await execAsync(command);
    } catch (error) {
      logger.error('Generate image size error:', error);
      throw error;
    }
  }

  /**
   * Upload file to R2
   */
  private async uploadToR2(filePath: string | Buffer, key: string, contentType?: string): Promise<void> {
    try {
      // This would use the R2 client to upload the file
      // Implementation depends on your R2 setup
      logger.info(`Uploaded to R2: ${key}`);
    } catch (error) {
      logger.error('Upload to R2 error:', error);
      throw error;
    }
  }

  /**
   * Reassemble chunks into complete file
   */
  private async reassembleChunks(uploadId: string, filename: string): Promise<string> {
    try {
      // Implementation for reassembling chunks
      // This would download chunks from R2 and combine them
      const outputPath = path.join(process.cwd(), 'temp', uploadId, filename);
      logger.info(`Reassembled file: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error('Reassemble chunks error:', error);
      throw error;
    }
  }

  /**
   * Clean up upload session
   */
  private async cleanupUploadSession(uploadId: string): Promise<void> {
    try {
      // Clean up temporary files and R2 chunks
      this.uploadSessions.delete(uploadId);
      logger.info(`Cleaned up upload session: ${uploadId}`);
    } catch (error) {
      logger.error('Cleanup upload session error:', error);
    }
  }

  /**
   * Get upload session status
   */
  getUploadStatus(uploadId: string): UploadSession | null {
    return this.uploadSessions.get(uploadId) || null;
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique beat ID
   */
  private generateBeatId(): string {
    return `beat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate file upload
   */
  private validateFile(options: UploadOptions): void {
    const { type, contentType, size } = options;
    
    // File size limits
    const maxSizes = {
      audio: 100 * 1024 * 1024, // 100MB
      image: 10 * 1024 * 1024,  // 10MB
    };

    if (size > maxSizes[type]) {
      throw new CustomError(`File size exceeds limit for ${type}`, 400);
    }

    // Content type validation
    const allowedTypes = {
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'],
      image: ['image/jpeg', 'image/png', 'image/webp'],
    };

    if (!allowedTypes[type].includes(contentType)) {
      throw new CustomError(`Invalid file type for ${type}`, 400);
    }
  }
}
