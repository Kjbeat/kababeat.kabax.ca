export declare const mediaConfig: {
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
    audioQuality: {
        preview: {
            duration: number;
            bitrate: string;
            channels: number;
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
    };
    imageSizes: {
        mini: {
            width: number;
            height: number;
            quality: number;
            format: string;
        };
        small: {
            width: number;
            height: number;
            quality: number;
            format: string;
        };
        medium: {
            width: number;
            height: number;
            quality: number;
            format: string;
        };
        large: {
            width: number;
            height: number;
            quality: number;
            format: string;
        };
    };
    hls: {
        segmentDuration: number;
        playlistType: string;
        targetDuration: number;
    };
    r2: {
        bucketName: string;
        region: string;
        endpoint: string | undefined;
    };
    ffmpeg: {
        path: string;
        ffprobePath: string;
        timeout: number;
    };
    tempDir: string;
    cdn: {
        baseUrl: string;
        cacheTtl: number;
    };
};
export default mediaConfig;
//# sourceMappingURL=media.config.d.ts.map