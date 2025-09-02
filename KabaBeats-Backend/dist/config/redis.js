"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shutdownRedis = exports.initializeRedis = exports.redisService = void 0;
const redis_1 = require("redis");
const logger_1 = require("./logger");
class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }
    async connect() {
        try {
            this.client = (0, redis_1.createClient)({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger_1.logger.error('Redis connection failed after 10 retries');
                            return new Error('Redis connection failed');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });
            this.client.on('error', (err) => {
                logger_1.logger.error('Redis Client Error:', err);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                logger_1.logger.info('Redis client connected');
                this.isConnected = true;
            });
            this.client.on('disconnect', () => {
                logger_1.logger.warn('Redis client disconnected');
                this.isConnected = false;
            });
            await this.client.connect();
        }
        catch (error) {
            logger_1.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            this.client = null;
            this.isConnected = false;
        }
    }
    getClient() {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client not connected');
        }
        return this.client;
    }
    isClientConnected() {
        return this.isConnected && this.client !== null;
    }
    async setSession(key, value, ttlSeconds) {
        const client = this.getClient();
        const serializedValue = JSON.stringify(value);
        if (ttlSeconds) {
            await client.setEx(key, ttlSeconds, serializedValue);
        }
        else {
            await client.set(key, serializedValue);
        }
    }
    async getSession(key) {
        const client = this.getClient();
        const value = await client.get(key);
        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Error parsing Redis session data:', error);
            return null;
        }
    }
    async deleteSession(key) {
        const client = this.getClient();
        await client.del(key);
    }
    async existsSession(key) {
        const client = this.getClient();
        const result = await client.exists(key);
        return result === 1;
    }
    async setSessionTTL(key, ttlSeconds) {
        const client = this.getClient();
        await client.expire(key, ttlSeconds);
    }
    async getSessionTTL(key) {
        const client = this.getClient();
        return await client.ttl(key);
    }
    async setChunkedUploadSession(sessionId, sessionData, ttlSeconds = 86400) {
        const key = `chunked_upload:${sessionId}`;
        await this.setSession(key, sessionData, ttlSeconds);
    }
    async getChunkedUploadSession(sessionId) {
        const key = `chunked_upload:${sessionId}`;
        return await this.getSession(key);
    }
    async deleteChunkedUploadSession(sessionId) {
        const key = `chunked_upload:${sessionId}`;
        await this.deleteSession(key);
    }
    async setHLSPlaylist(beatId, playlistType, playlistData, ttlSeconds = 3600) {
        const key = `hls_playlist:${beatId}:${playlistType}`;
        await this.setSession(key, playlistData, ttlSeconds);
    }
    async getHLSPlaylist(beatId, playlistType) {
        const key = `hls_playlist:${beatId}:${playlistType}`;
        return await this.getSession(key);
    }
    async setProcessedFileCache(fileKey, metadata, ttlSeconds = 86400) {
        const key = `processed_file:${fileKey}`;
        await this.setSession(key, metadata, ttlSeconds);
    }
    async getProcessedFileCache(fileKey) {
        const key = `processed_file:${fileKey}`;
        return await this.getSession(key);
    }
    async cleanupExpiredSessions() {
        const client = this.getClient();
        const chunkedUploadKeys = await client.keys('chunked_upload:*');
        for (const key of chunkedUploadKeys) {
            const ttl = await client.ttl(key);
            if (ttl === -2) {
                await client.del(key);
            }
        }
        logger_1.logger.info(`Cleaned up ${chunkedUploadKeys.length} chunked upload sessions`);
    }
    async ping() {
        try {
            const client = this.getClient();
            const result = await client.ping();
            return result === 'PONG';
        }
        catch (error) {
            logger_1.logger.error('Redis ping failed:', error);
            return false;
        }
    }
}
exports.redisService = new RedisService();
const initializeRedis = async () => {
    try {
        await exports.redisService.connect();
        logger_1.logger.info('Redis service initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize Redis service:', error);
        logger_1.logger.warn('Continuing without Redis - using in-memory storage fallback');
    }
};
exports.initializeRedis = initializeRedis;
const shutdownRedis = async () => {
    try {
        await exports.redisService.disconnect();
        logger_1.logger.info('Redis service disconnected');
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting Redis service:', error);
    }
};
exports.shutdownRedis = shutdownRedis;
//# sourceMappingURL=redis.js.map