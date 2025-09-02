export interface MediaProcessingOptions {
    audio?: {
        quality?: 'low' | 'medium' | 'high';
        format?: 'mp3' | 'wav' | 'm4a';
        bitrate?: number;
    };
    image?: {
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
        maxWidth?: number;
        maxHeight?: number;
        generateThumbnail?: boolean;
    };
}
export interface ProcessingResult {
    originalKey: string;
    processedKey?: string;
    thumbnailKey?: string;
    metadata: {
        duration?: number;
        bitrate?: number;
        sampleRate?: number;
        width?: number;
        height?: number;
        format: string;
        size: number;
    };
}
export declare const processMediaFile: (key: string, contentType: string, options?: MediaProcessingOptions) => Promise<ProcessingResult>;
export declare const validateAudioFile: (contentType: string, size: number) => boolean;
export declare const validateImageFile: (contentType: string, size: number) => boolean;
export declare const getImageDimensions: (useCase: "profile" | "artwork" | "thumbnail") => {
    width: number;
    height: number;
};
export declare const getAudioSettings: (useCase: "preview" | "full" | "download") => MediaProcessingOptions["audio"];
//# sourceMappingURL=mediaProcessor.d.ts.map