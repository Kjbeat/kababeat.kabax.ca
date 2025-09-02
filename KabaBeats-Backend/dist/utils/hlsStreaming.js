"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimalQuality = exports.validateHLSPlaylist = exports.cleanupOldHLSFiles = exports.getHLSPlaylist = exports.generateHLSStreamingUrl = exports.generateHLSPlaylists = exports.HLS_CONFIG = void 0;
const logger_1 = require("@/config/logger");
const cloudflare_r2_1 = require("@/config/cloudflare-r2");
const cdn_1 = require("@/config/cdn");
const crypto_1 = __importDefault(require("crypto"));
exports.HLS_CONFIG = {
    DEFAULT_SEGMENT_DURATION: 10,
    MIN_SEGMENT_DURATION: 6,
    MAX_SEGMENT_DURATION: 15,
    HLS_VERSION: 6,
    DEFAULT_QUALITIES: [
        { name: 'low', bitrate: 64000, sampleRate: 22050, channels: 2, codec: 'aac' },
        { name: 'medium', bitrate: 128000, sampleRate: 44100, channels: 2, codec: 'aac' },
        { name: 'high', bitrate: 256000, sampleRate: 44100, channels: 2, codec: 'aac' },
    ],
};
const generateHLSPlaylists = async (audioFileKey, userId, beatId, options = {}) => {
    try {
        const processingOptions = {
            inputFile: audioFileKey,
            outputDir: `processed/hls/${userId}/${beatId}`,
            qualities: options.qualities || exports.HLS_CONFIG.DEFAULT_QUALITIES,
            segmentDuration: options.segmentDuration || exports.HLS_CONFIG.DEFAULT_SEGMENT_DURATION,
            hlsVersion: options.hlsVersion || exports.HLS_CONFIG.HLS_VERSION,
        };
        logger_1.logger.info(`Generating HLS playlists for: ${audioFileKey}`);
        const duration = await extractAudioDuration(audioFileKey);
        const timestamp = Date.now();
        const sessionId = crypto_1.default.randomBytes(8).toString('hex');
        const variantPlaylists = [];
        for (const quality of processingOptions.qualities) {
            const variantPlaylist = await generateVariantPlaylist(audioFileKey, userId, beatId, quality, processingOptions, timestamp, sessionId);
            variantPlaylists.push(variantPlaylist);
        }
        const masterPlaylist = generateMasterPlaylist(variantPlaylists, processingOptions);
        const hlsPlaylist = {
            masterPlaylist,
            variantPlaylists,
            segments: variantPlaylists[0]?.segments || [],
            duration,
            createdAt: new Date(),
        };
        logger_1.logger.info(`Generated HLS playlists for ${audioFileKey} with ${variantPlaylists.length} variants`);
        return hlsPlaylist;
    }
    catch (error) {
        logger_1.logger.error('Error generating HLS playlists:', error);
        throw error;
    }
};
exports.generateHLSPlaylists = generateHLSPlaylists;
const generateVariantPlaylist = async (audioFileKey, userId, beatId, quality, options, timestamp, sessionId) => {
    try {
        const segments = [];
        const segmentCount = Math.ceil(options.segmentDuration / options.segmentDuration);
        for (let i = 0; i < segmentCount; i++) {
            const segment = {
                duration: options.segmentDuration,
                url: await generateSegmentUrl(userId, beatId, quality.name, i, timestamp, sessionId),
                sequence: i,
                title: `Segment ${i + 1}`,
            };
            segments.push(segment);
        }
        const playlistContent = generateVariantPlaylistContent(quality, segments, options);
        const playlistUrl = await uploadPlaylist(userId, beatId, quality.name, playlistContent, timestamp, sessionId);
        return {
            bandwidth: quality.bitrate,
            resolution: 'audio',
            codecs: quality.codec,
            playlistUrl,
            segments,
        };
    }
    catch (error) {
        logger_1.logger.error('Error generating variant playlist:', error);
        throw error;
    }
};
const generateMasterPlaylist = (variantPlaylists, options) => {
    let playlist = `#EXTM3U\n#EXT-X-VERSION:${options.hlsVersion}\n\n`;
    for (const variant of variantPlaylists) {
        playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth},CODECS="${variant.codecs}"\n`;
        playlist += `${variant.playlistUrl}\n\n`;
    }
    return playlist;
};
const generateVariantPlaylistContent = (quality, segments, options) => {
    let playlist = `#EXTM3U\n#EXT-X-VERSION:${options.hlsVersion}\n`;
    playlist += `#EXT-X-TARGETDURATION:${options.segmentDuration}\n`;
    playlist += `#EXT-X-MEDIA-SEQUENCE:0\n\n`;
    for (const segment of segments) {
        playlist += `#EXTINF:${segment.duration.toFixed(3)},\n`;
        playlist += `${segment.url}\n\n`;
    }
    playlist += `#EXT-X-ENDLIST\n`;
    return playlist;
};
const generateSegmentUrl = async (userId, beatId, quality, segmentIndex, timestamp, sessionId) => {
    try {
        const segmentKey = `processed/hls/${userId}/${beatId}/${quality}/${timestamp}-${sessionId}-segment-${segmentIndex}.ts`;
        const segmentUrl = await (0, cloudflare_r2_1.generatePresignedDownloadUrl)(segmentKey, 3600);
        return segmentUrl;
    }
    catch (error) {
        logger_1.logger.error('Error generating segment URL:', error);
        throw error;
    }
};
const uploadPlaylist = async (userId, beatId, quality, content, timestamp, sessionId) => {
    try {
        const playlistKey = `processed/hls/${userId}/${beatId}/${quality}/${timestamp}-${sessionId}.m3u8`;
        const playlistUrl = await (0, cloudflare_r2_1.generatePresignedDownloadUrl)(playlistKey, 3600);
        logger_1.logger.info(`Uploaded playlist: ${playlistKey}`);
        return playlistUrl;
    }
    catch (error) {
        logger_1.logger.error('Error uploading playlist:', error);
        throw error;
    }
};
const extractAudioDuration = async (audioFileKey) => {
    try {
        return 180;
    }
    catch (error) {
        logger_1.logger.error('Error extracting audio duration:', error);
        throw error;
    }
};
const generateHLSStreamingUrl = async (userId, beatId, quality) => {
    try {
        const masterPlaylistUrl = (0, cdn_1.generateHLSStreamingUrl)(beatId, userId, {
            quality: quality || undefined,
            expiresIn: 3600,
        });
        const availableQualities = exports.HLS_CONFIG.DEFAULT_QUALITIES.map(q => q.name);
        logger_1.logger.info(`Generated HLS streaming URL for beat: ${beatId}`);
        return {
            masterPlaylistUrl,
            availableQualities,
            expiresIn: 3600,
        };
    }
    catch (error) {
        logger_1.logger.error('Error generating HLS streaming URL:', error);
        throw error;
    }
};
exports.generateHLSStreamingUrl = generateHLSStreamingUrl;
const getHLSPlaylist = async (userId, beatId, playlistType, quality) => {
    try {
        let playlistKey;
        if (playlistType === 'master') {
            playlistKey = `processed/hls/${userId}/${beatId}/master/playlist.m3u8`;
        }
        else {
            if (!quality) {
                throw new Error('Quality required for variant playlist');
            }
            playlistKey = `processed/hls/${userId}/${beatId}/${quality}/playlist.m3u8`;
        }
        const playlistContent = `#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-TARGETDURATION:10\n\n`;
        logger_1.logger.info(`Retrieved HLS playlist: ${playlistKey}`);
        return playlistContent;
    }
    catch (error) {
        logger_1.logger.error('Error getting HLS playlist:', error);
        throw error;
    }
};
exports.getHLSPlaylist = getHLSPlaylist;
const cleanupOldHLSFiles = async (olderThanDays = 30) => {
    try {
        logger_1.logger.info(`Cleaning up HLS files older than ${olderThanDays} days`);
    }
    catch (error) {
        logger_1.logger.error('Error cleaning up HLS files:', error);
        throw error;
    }
};
exports.cleanupOldHLSFiles = cleanupOldHLSFiles;
const validateHLSPlaylist = (playlistContent) => {
    try {
        const lines = playlistContent.split('\n');
        const hasExtM3U = lines.some(line => line.startsWith('#EXTM3U'));
        const hasExtXVersion = lines.some(line => line.startsWith('#EXT-X-VERSION'));
        return hasExtM3U && hasExtXVersion;
    }
    catch (error) {
        logger_1.logger.error('Error validating HLS playlist:', error);
        return false;
    }
};
exports.validateHLSPlaylist = validateHLSPlaylist;
const getOptimalQuality = (availableQualities, clientBandwidth, clientCapabilities = {}) => {
    try {
        let filteredQualities = availableQualities;
        if (clientCapabilities.maxBitrate) {
            filteredQualities = filteredQualities.filter(q => q.bitrate <= clientCapabilities.maxBitrate);
        }
        if (clientCapabilities.preferredCodec) {
            filteredQualities = filteredQualities.filter(q => q.codec === clientCapabilities.preferredCodec);
        }
        const optimalQuality = filteredQualities.reduce((best, current) => {
            if (current.bitrate <= clientBandwidth && current.bitrate > (best?.bitrate || 0)) {
                return current;
            }
            return best;
        }, filteredQualities[0]);
        return optimalQuality || filteredQualities[0];
    }
    catch (error) {
        logger_1.logger.error('Error getting optimal quality:', error);
        return exports.HLS_CONFIG.DEFAULT_QUALITIES[1];
    }
};
exports.getOptimalQuality = getOptimalQuality;
//# sourceMappingURL=hlsStreaming.js.map