export interface CDNConfig {
    provider: 'cloudflare' | 'aws-cloudfront' | 'custom';
    baseUrl: string;
    cacheSettings: {
        defaultTTL: number;
        maxTTL: number;
        minTTL: number;
    };
    streamingSettings: {
        enableHLS: boolean;
        enableDASH: boolean;
        segmentDuration: number;
    };
}
export interface CDNResponse {
    success: boolean;
    url?: string;
    error?: string;
}
declare class CDNService {
    private config;
    constructor(config: CDNConfig);
    generateCDNUrl(fileKey: string, options?: {
        expiresIn?: number;
        quality?: string;
        format?: string;
    }): string;
    generateHLSStreamingUrl(beatId: string, userId: string, options?: {
        quality?: string;
        expiresIn?: number;
    }): string;
    purgeCache(fileKey: string): Promise<CDNResponse>;
    getCDNStats(): Promise<{
        totalRequests: number;
        cacheHitRate: number;
        bandwidth: number;
        errors: number;
    }>;
    getCacheHeaders(fileType: 'audio' | 'image' | 'hls' | 'static'): Record<string, string>;
}
export declare const cdnService: CDNService;
export declare const generateCDNUrl: (fileKey: string, options?: {
    expiresIn?: number;
    quality?: string;
    format?: string;
}) => string;
export declare const generateHLSStreamingUrl: (beatId: string, userId: string, options?: {
    quality?: string;
    expiresIn?: number;
}) => string;
export declare const getCacheHeaders: (fileType: "audio" | "image" | "hls" | "static") => Record<string, string>;
export declare const purgeCDNCache: (fileKey: string) => Promise<CDNResponse>;
export declare const getCDNStats: () => Promise<{
    totalRequests: number;
    cacheHitRate: number;
    bandwidth: number;
    errors: number;
}>;
export {};
//# sourceMappingURL=cdn.d.ts.map