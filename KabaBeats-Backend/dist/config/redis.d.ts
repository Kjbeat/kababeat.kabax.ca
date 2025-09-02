import { RedisClientType } from 'redis';
declare class RedisService {
    private client;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): RedisClientType;
    isClientConnected(): boolean;
    setSession(key: string, value: any, ttlSeconds?: number): Promise<void>;
    getSession<T>(key: string): Promise<T | null>;
    deleteSession(key: string): Promise<void>;
    existsSession(key: string): Promise<boolean>;
    setSessionTTL(key: string, ttlSeconds: number): Promise<void>;
    getSessionTTL(key: string): Promise<number>;
    setChunkedUploadSession(sessionId: string, sessionData: any, ttlSeconds?: number): Promise<void>;
    getChunkedUploadSession<T>(sessionId: string): Promise<T | null>;
    deleteChunkedUploadSession(sessionId: string): Promise<void>;
    setHLSPlaylist(beatId: string, playlistType: string, playlistData: string, ttlSeconds?: number): Promise<void>;
    getHLSPlaylist(beatId: string, playlistType: string): Promise<string | null>;
    setProcessedFileCache(fileKey: string, metadata: any, ttlSeconds?: number): Promise<void>;
    getProcessedFileCache(fileKey: string): Promise<any | null>;
    cleanupExpiredSessions(): Promise<void>;
    ping(): Promise<boolean>;
}
export declare const redisService: RedisService;
export declare const initializeRedis: () => Promise<void>;
export declare const shutdownRedis: () => Promise<void>;
export {};
//# sourceMappingURL=redis.d.ts.map