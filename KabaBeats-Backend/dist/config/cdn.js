"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCDNStats = exports.purgeCDNCache = exports.getCacheHeaders = exports.generateHLSStreamingUrl = exports.generateCDNUrl = exports.cdnService = void 0;
const logger_1 = require("./logger");
class CDNService {
    constructor(config) {
        this.config = config;
    }
    generateCDNUrl(fileKey, options = {}) {
        try {
            const { baseUrl } = this.config;
            let url = `${baseUrl}/${fileKey}`;
            const params = new URLSearchParams();
            if (options.expiresIn) {
                params.append('expires', (Date.now() + options.expiresIn * 1000).toString());
            }
            if (options.quality) {
                params.append('quality', options.quality);
            }
            if (options.format) {
                params.append('format', options.format);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            logger_1.logger.info(`Generated CDN URL: ${url}`);
            return url;
        }
        catch (error) {
            logger_1.logger.error('Error generating CDN URL:', error);
            throw error;
        }
    }
    generateHLSStreamingUrl(beatId, userId, options = {}) {
        try {
            const { baseUrl } = this.config;
            const hlsPath = `processed/hls/${userId}/${beatId}`;
            let url;
            if (options.quality) {
                url = `${baseUrl}/${hlsPath}/${options.quality}/playlist.m3u8`;
            }
            else {
                url = `${baseUrl}/${hlsPath}/master/playlist.m3u8`;
            }
            const params = new URLSearchParams();
            if (options.expiresIn) {
                params.append('expires', (Date.now() + options.expiresIn * 1000).toString());
            }
            params.append('cache', 'public');
            params.append('max-age', this.config.cacheSettings.defaultTTL.toString());
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            logger_1.logger.info(`Generated HLS streaming URL: ${url}`);
            return url;
        }
        catch (error) {
            logger_1.logger.error('Error generating HLS streaming URL:', error);
            throw error;
        }
    }
    async purgeCache(fileKey) {
        try {
            logger_1.logger.info(`Purging CDN cache for: ${fileKey}`);
            return {
                success: true,
                url: fileKey,
            };
        }
        catch (error) {
            logger_1.logger.error('Error purging CDN cache:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getCDNStats() {
        try {
            return {
                totalRequests: 0,
                cacheHitRate: 0.95,
                bandwidth: 0,
                errors: 0,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting CDN stats:', error);
            throw error;
        }
    }
    getCacheHeaders(fileType) {
        const { cacheSettings } = this.config;
        switch (fileType) {
            case 'audio':
                return {
                    'Cache-Control': `public, max-age=${cacheSettings.maxTTL}`,
                    'Expires': new Date(Date.now() + cacheSettings.maxTTL * 1000).toUTCString(),
                };
            case 'image':
                return {
                    'Cache-Control': `public, max-age=${cacheSettings.maxTTL}`,
                    'Expires': new Date(Date.now() + cacheSettings.maxTTL * 1000).toUTCString(),
                };
            case 'hls':
                return {
                    'Cache-Control': `public, max-age=${cacheSettings.defaultTTL}`,
                    'Content-Type': 'application/vnd.apple.mpegurl',
                };
            case 'static':
                return {
                    'Cache-Control': `public, max-age=${cacheSettings.maxTTL}`,
                    'Expires': new Date(Date.now() + cacheSettings.maxTTL * 1000).toUTCString(),
                };
            default:
                return {
                    'Cache-Control': `public, max-age=${cacheSettings.defaultTTL}`,
                };
        }
    }
}
const cdnConfig = {
    provider: 'cloudflare',
    baseUrl: process.env.CDN_BASE_URL || 'https://media.kababeat.kabax.ca',
    cacheSettings: {
        defaultTTL: 3600,
        maxTTL: 86400,
        minTTL: 300,
    },
    streamingSettings: {
        enableHLS: true,
        enableDASH: false,
        segmentDuration: 10,
    },
};
exports.cdnService = new CDNService(cdnConfig);
const generateCDNUrl = (fileKey, options) => {
    return exports.cdnService.generateCDNUrl(fileKey, options);
};
exports.generateCDNUrl = generateCDNUrl;
const generateHLSStreamingUrl = (beatId, userId, options) => {
    return exports.cdnService.generateHLSStreamingUrl(beatId, userId, options);
};
exports.generateHLSStreamingUrl = generateHLSStreamingUrl;
const getCacheHeaders = (fileType) => {
    return exports.cdnService.getCacheHeaders(fileType);
};
exports.getCacheHeaders = getCacheHeaders;
const purgeCDNCache = async (fileKey) => {
    return await exports.cdnService.purgeCache(fileKey);
};
exports.purgeCDNCache = purgeCDNCache;
const getCDNStats = async () => {
    return await exports.cdnService.getCDNStats();
};
exports.getCDNStats = getCDNStats;
//# sourceMappingURL=cdn.js.map