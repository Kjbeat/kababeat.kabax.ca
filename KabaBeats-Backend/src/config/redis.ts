import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  // Session management methods
  async setSession(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const client = this.getClient();
    const serializedValue = JSON.stringify(value);
    
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
  }

  async getSession<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    const value = await client.get(key);
    
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value as string) as T;
    } catch (error) {
      logger.error('Error parsing Redis session data:', error);
      return null;
    }
  }

  async deleteSession(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }

  async existsSession(key: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  async setSessionTTL(key: string, ttlSeconds: number): Promise<void> {
    const client = this.getClient();
    await client.expire(key, ttlSeconds);
  }

  async getSessionTTL(key: string): Promise<number> {
    const client = this.getClient();
    return await client.ttl(key);
  }

  // Chunked upload session methods
  async setChunkedUploadSession(sessionId: string, sessionData: any, ttlSeconds: number = 86400): Promise<void> {
    const key = `chunked_upload:${sessionId}`;
    await this.setSession(key, sessionData, ttlSeconds);
  }

  async getChunkedUploadSession<T>(sessionId: string): Promise<T | null> {
    const key = `chunked_upload:${sessionId}`;
    return await this.getSession<T>(key);
  }

  async deleteChunkedUploadSession(sessionId: string): Promise<void> {
    const key = `chunked_upload:${sessionId}`;
    await this.deleteSession(key);
  }

  // HLS streaming cache methods
  async setHLSPlaylist(beatId: string, playlistType: string, playlistData: string, ttlSeconds: number = 3600): Promise<void> {
    const key = `hls_playlist:${beatId}:${playlistType}`;
    await this.setSession(key, playlistData, ttlSeconds);
  }

  async getHLSPlaylist(beatId: string, playlistType: string): Promise<string | null> {
    const key = `hls_playlist:${beatId}:${playlistType}`;
    return await this.getSession<string>(key);
  }

  // Cache methods for processed files
  async setProcessedFileCache(fileKey: string, metadata: any, ttlSeconds: number = 86400): Promise<void> {
    const key = `processed_file:${fileKey}`;
    await this.setSession(key, metadata, ttlSeconds);
  }

  async getProcessedFileCache(fileKey: string): Promise<any | null> {
    const key = `processed_file:${fileKey}`;
    return await this.getSession(key);
  }

  // Cleanup methods
  async cleanupExpiredSessions(): Promise<void> {
    const client = this.getClient();
    
    // Get all chunked upload session keys
    const chunkedUploadKeys = await client.keys('chunked_upload:*');
    
    for (const key of chunkedUploadKeys) {
      const ttl = await client.ttl(key);
      if (ttl === -2) { // Key doesn't exist
        await client.del(key);
      }
    }
    
    logger.info(`Cleaned up ${chunkedUploadKeys.length} chunked upload sessions`);
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const client = this.getClient();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const redisService = new RedisService();

// Initialize Redis connection
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisService.connect();
    logger.info('Redis service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Redis service:', error);
    // Don't throw error - allow app to continue without Redis
    logger.warn('Continuing without Redis - using in-memory storage fallback');
  }
};

// Graceful shutdown
export const shutdownRedis = async (): Promise<void> => {
  try {
    await redisService.disconnect();
    logger.info('Redis service disconnected');
  } catch (error) {
    logger.error('Error disconnecting Redis service:', error);
  }
};
