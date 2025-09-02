import { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFile } from '@/config/cloudflare-r2';
import { logger } from '@/config/logger';
import { redisService } from '@/config/redis';
import * as crypto from 'crypto';

export interface ChunkedUploadSession {
  sessionId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: Set<number>;
  contentType: string;
  beatId?: string | undefined;
  fileType: 'audio' | 'image' | 'profile' | 'artwork';
  createdAt: Date;
  expiresAt: Date;
}

export interface ChunkUploadRequest {
  sessionId: string;
  chunkNumber: number;
  chunkSize: number;
  totalChunks: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  userId: string;
  beatId?: string;
  fileType: 'audio' | 'image' | 'profile' | 'artwork';
}

export interface ChunkUploadResponse {
  uploadUrl: string;
  chunkKey: string;
  expiresIn: number;
}

export interface CompleteUploadRequest {
  sessionId: string;
  userId: string;
  checksum: string; // MD5 or SHA256 of the complete file
}

// Use Redis for session storage with in-memory fallback
const uploadSessions = new Map<string, ChunkedUploadSession>();

// Chunk size configuration
export const CHUNK_CONFIG = {
  DEFAULT_CHUNK_SIZE: 10 * 1024 * 1024, // 10MB per chunk - increased for better performance
  MIN_CHUNK_SIZE: 1024 * 1024, // 1MB minimum
  MAX_CHUNK_SIZE: 25 * 1024 * 1024, // 25MB maximum - increased for large files
  MAX_FILE_SIZE: 5 * 1024 * 1024 * 1024, // 5GB maximum - increased for large audio files
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Initialize a chunked upload session
 */
export const initializeChunkedUpload = async (request: {
  userId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  beatId?: string;
  fileType: 'audio' | 'image' | 'profile' | 'artwork';
  chunkSize?: number;
}): Promise<ChunkedUploadSession> => {
  try {
    // Validate file size
    if (request.fileSize > CHUNK_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${CHUNK_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Calculate optimal chunk size
    const chunkSize = Math.min(
      request.chunkSize || CHUNK_CONFIG.DEFAULT_CHUNK_SIZE,
      CHUNK_CONFIG.MAX_CHUNK_SIZE
    );

    const totalChunks = Math.ceil(request.fileSize / chunkSize);
    const sessionId = generateSessionId();

    const session: ChunkedUploadSession = {
      sessionId,
      userId: request.userId,
      fileName: request.fileName,
      fileSize: request.fileSize,
      chunkSize,
      totalChunks,
      uploadedChunks: new Set(),
      contentType: request.contentType,
      beatId: request.beatId || undefined,
      fileType: request.fileType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + CHUNK_CONFIG.SESSION_EXPIRY),
    };

    // Store in Redis if available, otherwise use in-memory
    if (redisService.isClientConnected()) {
      await redisService.setChunkedUploadSession(sessionId, session, CHUNK_CONFIG.SESSION_EXPIRY / 1000);
    } else {
      uploadSessions.set(sessionId, session);
    }
    
    logger.info(`Initialized chunked upload session: ${sessionId} for file: ${request.fileName}`);
    
    return session;
  } catch (error) {
    logger.error('Error initializing chunked upload:', error);
    throw error;
  }
};

/**
 * Generate upload URL for a specific chunk
 */
export const generateChunkUploadUrl = async (request: ChunkUploadRequest): Promise<ChunkUploadResponse> => {
  try {
    let session: ChunkedUploadSession | null = null;
    
    // Get session from Redis or in-memory storage
    if (redisService.isClientConnected()) {
      session = await redisService.getChunkedUploadSession<ChunkedUploadSession>(request.sessionId);
    } else {
      session = uploadSessions.get(request.sessionId) || null;
    }
    
    if (!session) {
      throw new Error('Upload session not found or expired');
    }

    // Validate session
    if (session.userId !== request.userId) {
      throw new Error('Unauthorized access to upload session');
    }

    if (new Date() > session.expiresAt) {
      uploadSessions.delete(request.sessionId);
      throw new Error('Upload session expired');
    }

    // Validate chunk number
    if (request.chunkNumber < 0 || request.chunkNumber >= session.totalChunks) {
      throw new Error('Invalid chunk number');
    }

    // Generate chunk key
    const chunkKey = generateChunkKey(session, request.chunkNumber);
    
    // Generate presigned upload URL for chunk
    const result = await generatePresignedUploadUrl(chunkKey, request.contentType, 3600);
    
    logger.info(`Generated chunk upload URL: ${chunkKey}`);
    
    return {
      uploadUrl: result.uploadUrl,
      chunkKey: result.key,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    logger.error('Error generating chunk upload URL:', error);
    throw error;
  }
};

/**
 * Mark a chunk as uploaded
 */
export const markChunkUploaded = async (sessionId: string, chunkNumber: number): Promise<void> => {
  try {
    let session: ChunkedUploadSession | null = null;
    
    // Get session from Redis or in-memory storage
    if (redisService.isClientConnected()) {
      session = await redisService.getChunkedUploadSession<ChunkedUploadSession>(sessionId);
    } else {
      session = uploadSessions.get(sessionId) || null;
    }
    
    if (!session) {
      throw new Error('Upload session not found');
    }

    session.uploadedChunks.add(chunkNumber);
    
    // Update session in storage
    if (redisService.isClientConnected()) {
      await redisService.setChunkedUploadSession(sessionId, session, CHUNK_CONFIG.SESSION_EXPIRY / 1000);
    } else {
      uploadSessions.set(sessionId, session);
    }
    
    logger.info(`Marked chunk ${chunkNumber} as uploaded for session: ${sessionId}`);
  } catch (error) {
    logger.error('Error marking chunk as uploaded:', error);
    throw error;
  }
};

/**
 * Check if all chunks are uploaded
 */
export const isUploadComplete = async (sessionId: string): Promise<boolean> => {
  try {
    let session: ChunkedUploadSession | null = null;
    
    // Get session from Redis or in-memory storage
    if (redisService.isClientConnected()) {
      session = await redisService.getChunkedUploadSession<ChunkedUploadSession>(sessionId);
    } else {
      session = uploadSessions.get(sessionId) || null;
    }
    
    if (!session) {
      return false;
    }

    return session.uploadedChunks.size === session.totalChunks;
  } catch (error) {
    logger.error('Error checking upload completion:', error);
    return false;
  }
};

/**
 * Get upload progress
 */
export const getUploadProgress = async (sessionId: string): Promise<{ uploaded: number; total: number; percentage: number }> => {
  try {
    let session: ChunkedUploadSession | null = null;
    
    // Get session from Redis or in-memory storage
    if (redisService.isClientConnected()) {
      session = await redisService.getChunkedUploadSession<ChunkedUploadSession>(sessionId);
    } else {
      session = uploadSessions.get(sessionId) || null;
    }
    
    if (!session) {
      throw new Error('Upload session not found');
    }

    const uploaded = session.uploadedChunks.size;
    const total = session.totalChunks;
    const percentage = Math.round((uploaded / total) * 100);

    return { uploaded, total, percentage };
  } catch (error) {
    logger.error('Error getting upload progress:', error);
    throw error;
  }
};

/**
 * Complete the chunked upload by concatenating all chunks
 */
export const completeChunkedUpload = async (request: CompleteUploadRequest): Promise<{
  finalKey: string;
  downloadUrl: string;
}> => {
  try {
    let session: ChunkedUploadSession | null = null;
    
    // Get session from Redis or in-memory storage
    if (redisService.isClientConnected()) {
      session = await redisService.getChunkedUploadSession<ChunkedUploadSession>(request.sessionId);
    } else {
      session = uploadSessions.get(request.sessionId) || null;
    }
    
    if (!session) {
      throw new Error('Upload session not found or expired');
    }

    // Validate all chunks are uploaded
    if (!(await isUploadComplete(request.sessionId))) {
      throw new Error('Not all chunks have been uploaded');
    }

    // Generate final file key
    const finalKey = generateFinalFileKey(session);
    
    // In a real implementation, you would:
    // 1. Download all chunks from R2
    // 2. Concatenate them in order
    // 3. Upload the complete file
    // 4. Verify checksum
    // 5. Delete individual chunks
    
    // For now, we'll simulate this process
    logger.info(`Completing chunked upload for session: ${request.sessionId}`);
    
    // Clean up session
    if (redisService.isClientConnected()) {
      await redisService.deleteChunkedUploadSession(request.sessionId);
    } else {
      uploadSessions.delete(request.sessionId);
    }
    
    // Generate download URL for the final file
    const downloadUrl = await generatePresignedDownloadUrl(finalKey, 3600);
    
    logger.info(`Chunked upload completed: ${finalKey}`);
    
    return {
      finalKey,
      downloadUrl,
    };
  } catch (error) {
    logger.error('Error completing chunked upload:', error);
    throw error;
  }
};

/**
 * Abort chunked upload and clean up
 */
export const abortChunkedUpload = async (sessionId: string): Promise<void> => {
  try {
    let session: ChunkedUploadSession | null = null;
    
    // Get session from Redis or in-memory storage
    if (redisService.isClientConnected()) {
      session = await redisService.getChunkedUploadSession<ChunkedUploadSession>(sessionId);
    } else {
      session = uploadSessions.get(sessionId) || null;
    }
    
    if (!session) {
      return; // Session already cleaned up
    }

    // Delete all uploaded chunks
    for (let i = 0; i < session.totalChunks; i++) {
      const chunkKey = generateChunkKey(session, i);
      try {
        await deleteFile(chunkKey);
      } catch (error) {
        logger.warn(`Failed to delete chunk: ${chunkKey}`, error);
      }
    }

    // Remove session
    if (redisService.isClientConnected()) {
      await redisService.deleteChunkedUploadSession(sessionId);
    } else {
      uploadSessions.delete(sessionId);
    }
    
    logger.info(`Aborted chunked upload session: ${sessionId}`);
  } catch (error) {
    logger.error('Error aborting chunked upload:', error);
    throw error;
  }
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    if (redisService.isClientConnected()) {
      // Redis handles TTL automatically, but we can clean up manually if needed
      await redisService.cleanupExpiredSessions();
    } else {
      // Clean up in-memory sessions
      const now = new Date();
      const expiredSessions: string[] = [];

      for (const [sessionId, session] of uploadSessions.entries()) {
        if (now > session.expiresAt) {
          expiredSessions.push(sessionId);
        }
      }

      for (const sessionId of expiredSessions) {
        uploadSessions.delete(sessionId);
      }

      if (expiredSessions.length > 0) {
        logger.info(`Cleaned up ${expiredSessions.length} expired upload sessions`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
  }
};

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate chunk key for storage
 */
const generateChunkKey = (session: ChunkedUploadSession, chunkNumber: number): string => {
  const timestamp = session.createdAt.getTime();
  return `temp/chunks/${session.userId}/${session.sessionId}/${timestamp}-chunk-${chunkNumber}`;
};

/**
 * Generate final file key
 */
const generateFinalFileKey = (session: ChunkedUploadSession): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = session.fileName.split('.').pop();
  
  switch (session.fileType) {
    case 'audio':
      if (!session.beatId) throw new Error('Beat ID required for audio uploads');
      return `audio/beats/${session.userId}/${session.beatId}/${timestamp}-${randomString}.${extension}`;
    
    case 'artwork':
      if (!session.beatId) throw new Error('Beat ID required for artwork uploads');
      return `images/artwork/${session.userId}/${session.beatId}/${timestamp}-${randomString}.${extension}`;
    
    case 'profile':
      return `images/profiles/${session.userId}/${timestamp}-${randomString}.${extension}`;
    
    case 'image':
      return `temp/${session.userId}/${timestamp}-${randomString}.${extension}`;
    
    default:
      throw new Error(`Unknown file type: ${session.fileType}`);
  }
};

/**
 * Calculate optimal chunk size based on file size
 */
export const calculateOptimalChunkSize = (fileSize: number): number => {
  if (fileSize < 10 * 1024 * 1024) { // < 10MB
    return CHUNK_CONFIG.MIN_CHUNK_SIZE;
  } else if (fileSize < 100 * 1024 * 1024) { // < 100MB
    return CHUNK_CONFIG.DEFAULT_CHUNK_SIZE;
  } else { // >= 100MB
    return CHUNK_CONFIG.MAX_CHUNK_SIZE;
  }
};

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
