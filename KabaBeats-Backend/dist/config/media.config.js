"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaConfig = void 0;
exports.mediaConfig = {
    maxFileSize: {
        audio: 100 * 1024 * 1024,
        image: 10 * 1024 * 1024,
    },
    allowedTypes: {
        audio: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'],
        image: ['image/jpeg', 'image/png', 'image/webp'],
    },
    chunkSize: 5 * 1024 * 1024,
    processingTimeout: 30 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000,
    audioQuality: {
        preview: {
            duration: 30,
            bitrate: '64k',
            channels: 2,
        },
        low: {
            bitrate: '128k',
            channels: 2,
        },
        medium: {
            bitrate: '320k',
            channels: 2,
        },
        high: {
            format: 'flac',
            quality: 'lossless',
        },
    },
    imageSizes: {
        mini: {
            width: 150,
            height: 150,
            quality: 80,
            format: 'webp',
        },
        small: {
            width: 300,
            height: 300,
            quality: 80,
            format: 'webp',
        },
        medium: {
            width: 600,
            height: 600,
            quality: 85,
            format: 'webp',
        },
        large: {
            width: 1200,
            height: 1200,
            quality: 90,
            format: 'webp',
        },
    },
    hls: {
        segmentDuration: 10,
        playlistType: 'VOD',
        targetDuration: 10,
    },
    r2: {
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'kababeats-media',
        region: process.env.CLOUDFLARE_R2_REGION || 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    },
    ffmpeg: {
        path: process.env.FFMPEG_PATH || 'ffmpeg',
        ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
        timeout: 30000,
    },
    tempDir: process.env.TEMP_DIR || 'temp',
    cdn: {
        baseUrl: process.env.CDN_BASE_URL || 'https://r2.example.com',
        cacheTtl: 86400,
    },
};
exports.default = exports.mediaConfig;
//# sourceMappingURL=media.config.js.map