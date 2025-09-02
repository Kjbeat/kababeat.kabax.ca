import { HLSPlaylist, AudioProcessingOptions } from './hlsStreaming';
export interface AudioMetadata {
    duration: number;
    bitrate: number;
    sampleRate: number;
    channels: number;
    format: string;
    codec: string;
    size: number;
}
export interface AudioProcessingResult {
    originalFile: string;
    processedFiles: {
        preview?: string;
        full?: string;
        hls?: HLSPlaylist;
    };
    metadata: AudioMetadata;
    processingTime: number;
}
export interface ProcessingOptions {
    generatePreview: boolean;
    previewDuration: number;
    generateHLS: boolean;
    hlsOptions?: Partial<AudioProcessingOptions>;
    outputFormats: string[];
    quality: 'low' | 'medium' | 'high';
}
export declare const processAudioFile: (inputFile: string, outputDir: string, options: ProcessingOptions) => Promise<AudioProcessingResult>;
export declare const extractAudioMetadata: (inputFile: string) => Promise<AudioMetadata>;
export declare const generateAudioPreview: (inputFile: string, outputDir: string, duration?: number, quality?: "low" | "medium" | "high") => Promise<string>;
export declare const generateFullAudio: (inputFile: string, outputDir: string, quality?: "low" | "medium" | "high") => Promise<string>;
export declare const generateHLSSegments: (inputFile: string, outputDir: string, segmentDuration?: number, qualities?: Array<{
    name: string;
    bitrate: number;
    sampleRate: number;
}>) => Promise<void>;
export declare const validateAudioFile: (filePath: string) => Promise<boolean>;
export declare const getAudioFileInfo: (filePath: string) => Promise<{
    isValid: boolean;
    metadata?: AudioMetadata;
    error?: string;
}>;
export declare const convertAudioFormat: (inputFile: string, outputFile: string, outputFormat: "mp3" | "wav" | "m4a" | "flac", quality?: "low" | "medium" | "high") => Promise<string>;
export declare const checkFFmpegAvailability: () => Promise<boolean>;
//# sourceMappingURL=audioProcessor.d.ts.map