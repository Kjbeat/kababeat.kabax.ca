export interface HLSPlaylist {
    masterPlaylist: string;
    variantPlaylists: HLSVariantPlaylist[];
    segments: HLSSegment[];
    duration: number;
    createdAt: Date;
}
export interface HLSVariantPlaylist {
    bandwidth: number;
    resolution: string;
    codecs: string;
    playlistUrl: string;
    segments: HLSSegment[];
}
export interface HLSSegment {
    duration: number;
    url: string;
    sequence: number;
    title?: string;
}
export interface AudioProcessingOptions {
    inputFile: string;
    outputDir: string;
    qualities: AudioQuality[];
    segmentDuration: number;
    hlsVersion: number;
}
export interface AudioQuality {
    name: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
    codec: string;
}
export declare const HLS_CONFIG: {
    readonly DEFAULT_SEGMENT_DURATION: 10;
    readonly MIN_SEGMENT_DURATION: 6;
    readonly MAX_SEGMENT_DURATION: 15;
    readonly HLS_VERSION: 6;
    readonly DEFAULT_QUALITIES: AudioQuality[];
};
export declare const generateHLSPlaylists: (audioFileKey: string, userId: string, beatId: string, options?: Partial<AudioProcessingOptions>) => Promise<HLSPlaylist>;
export declare const generateHLSStreamingUrl: (userId: string, beatId: string, quality?: string) => Promise<{
    masterPlaylistUrl: string;
    availableQualities: string[];
    expiresIn: number;
}>;
export declare const getHLSPlaylist: (userId: string, beatId: string, playlistType: "master" | "variant", quality?: string) => Promise<string>;
export declare const cleanupOldHLSFiles: (olderThanDays?: number) => Promise<void>;
export declare const validateHLSPlaylist: (playlistContent: string) => boolean;
export declare const getOptimalQuality: (availableQualities: AudioQuality[], clientBandwidth: number, clientCapabilities?: {
    maxBitrate?: number;
    preferredCodec?: string;
}) => AudioQuality;
//# sourceMappingURL=hlsStreaming.d.ts.map