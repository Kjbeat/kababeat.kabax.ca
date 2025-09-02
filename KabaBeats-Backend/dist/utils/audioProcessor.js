"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFFmpegAvailability = exports.convertAudioFormat = exports.getAudioFileInfo = exports.validateAudioFile = exports.generateHLSSegments = exports.generateFullAudio = exports.generateAudioPreview = exports.extractAudioMetadata = exports.processAudioFile = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("@/config/logger");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const hlsStreaming_1 = require("./hlsStreaming");
const processAudioFile = async (inputFile, outputDir, options) => {
    const startTime = Date.now();
    try {
        logger_1.logger.info(`Starting audio processing for: ${inputFile}`);
        const metadata = await (0, exports.extractAudioMetadata)(inputFile);
        await promises_1.default.mkdir(outputDir, { recursive: true });
        const processedFiles = {};
        if (options.generatePreview) {
            const previewFile = await (0, exports.generateAudioPreview)(inputFile, outputDir, options.previewDuration, options.quality);
            processedFiles.preview = previewFile;
        }
        const fullFile = await (0, exports.generateFullAudio)(inputFile, outputDir, options.quality);
        processedFiles.full = fullFile;
        if (options.generateHLS) {
            const hlsPlaylist = await (0, hlsStreaming_1.generateHLSPlaylists)(inputFile, path_1.default.basename(outputDir), path_1.default.basename(outputDir), options.hlsOptions);
            processedFiles.hls = hlsPlaylist;
        }
        const processingTime = Date.now() - startTime;
        logger_1.logger.info(`Audio processing completed in ${processingTime}ms`);
        return {
            originalFile: inputFile,
            processedFiles,
            metadata,
            processingTime,
        };
    }
    catch (error) {
        logger_1.logger.error('Error processing audio file:', error);
        throw error;
    }
};
exports.processAudioFile = processAudioFile;
const extractAudioMetadata = async (inputFile) => {
    return new Promise((resolve, reject) => {
        const ffprobe = (0, child_process_1.spawn)('ffprobe', [
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            inputFile
        ]);
        let output = '';
        let errorOutput = '';
        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });
        ffprobe.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        ffprobe.on('close', (code) => {
            if (code !== 0) {
                logger_1.logger.error('FFprobe error:', errorOutput);
                reject(new Error(`FFprobe failed with code ${code}`));
                return;
            }
            try {
                const metadata = JSON.parse(output);
                const audioStream = metadata.streams.find((stream) => stream.codec_type === 'audio');
                const format = metadata.format;
                if (!audioStream) {
                    reject(new Error('No audio stream found'));
                    return;
                }
                const audioMetadata = {
                    duration: parseFloat(format.duration) || 0,
                    bitrate: parseInt(format.bit_rate) || 0,
                    sampleRate: parseInt(audioStream.sample_rate) || 0,
                    channels: parseInt(audioStream.channels) || 0,
                    format: format.format_name || 'unknown',
                    codec: audioStream.codec_name || 'unknown',
                    size: parseInt(format.size) || 0,
                };
                logger_1.logger.info(`Extracted audio metadata:`, audioMetadata);
                resolve(audioMetadata);
            }
            catch (error) {
                logger_1.logger.error('Error parsing FFprobe output:', error);
                reject(error);
            }
        });
    });
};
exports.extractAudioMetadata = extractAudioMetadata;
const generateAudioPreview = async (inputFile, outputDir, duration = 30, quality = 'medium') => {
    return new Promise((resolve, reject) => {
        const outputFile = path_1.default.join(outputDir, 'preview.mp3');
        const qualitySettings = getQualitySettings(quality);
        const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
            '-i', inputFile,
            '-t', duration.toString(),
            '-c:a', 'libmp3lame',
            '-b:a', qualitySettings.bitrate.toString(),
            '-ar', qualitySettings.sampleRate.toString(),
            '-ac', '2',
            '-y',
            outputFile
        ]);
        let errorOutput = '';
        ffmpeg.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                logger_1.logger.error('FFmpeg preview generation error:', errorOutput);
                reject(new Error(`FFmpeg failed with code ${code}`));
                return;
            }
            logger_1.logger.info(`Generated audio preview: ${outputFile}`);
            resolve(outputFile);
        });
    });
};
exports.generateAudioPreview = generateAudioPreview;
const generateFullAudio = async (inputFile, outputDir, quality = 'medium') => {
    return new Promise((resolve, reject) => {
        const outputFile = path_1.default.join(outputDir, 'full.mp3');
        const qualitySettings = getQualitySettings(quality);
        const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
            '-i', inputFile,
            '-c:a', 'libmp3lame',
            '-b:a', qualitySettings.bitrate.toString(),
            '-ar', qualitySettings.sampleRate.toString(),
            '-ac', '2',
            '-y',
            outputFile
        ]);
        let errorOutput = '';
        ffmpeg.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                logger_1.logger.error('FFmpeg full audio generation error:', errorOutput);
                reject(new Error(`FFmpeg failed with code ${code}`));
                return;
            }
            logger_1.logger.info(`Generated full audio: ${outputFile}`);
            resolve(outputFile);
        });
    });
};
exports.generateFullAudio = generateFullAudio;
const generateHLSSegments = async (inputFile, outputDir, segmentDuration = 10, qualities = []) => {
    return new Promise((resolve, reject) => {
        const hlsDir = path_1.default.join(outputDir, 'hls');
        promises_1.default.mkdir(hlsDir, { recursive: true }).then(() => {
            const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
                '-i', inputFile,
                '-c:a', 'aac',
                '-b:a', '128k',
                '-ar', '44100',
                '-ac', '2',
                '-f', 'hls',
                '-hls_time', segmentDuration.toString(),
                '-hls_playlist_type', 'vod',
                '-hls_segment_filename', path_1.default.join(hlsDir, 'segment_%03d.ts'),
                path_1.default.join(hlsDir, 'playlist.m3u8')
            ]);
            let errorOutput = '';
            ffmpeg.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            ffmpeg.on('close', (code) => {
                if (code !== 0) {
                    logger_1.logger.error('FFmpeg HLS generation error:', errorOutput);
                    reject(new Error(`FFmpeg failed with code ${code}`));
                    return;
                }
                logger_1.logger.info(`Generated HLS segments in: ${hlsDir}`);
                resolve();
            });
        }).catch(reject);
    });
};
exports.generateHLSSegments = generateHLSSegments;
const getQualitySettings = (quality) => {
    switch (quality) {
        case 'low':
            return { bitrate: 64000, sampleRate: 22050 };
        case 'medium':
            return { bitrate: 128000, sampleRate: 44100 };
        case 'high':
            return { bitrate: 256000, sampleRate: 44100 };
        default:
            return { bitrate: 128000, sampleRate: 44100 };
    }
};
const validateAudioFile = async (filePath) => {
    try {
        const metadata = await (0, exports.extractAudioMetadata)(filePath);
        return metadata.duration > 0 && metadata.bitrate > 0;
    }
    catch (error) {
        logger_1.logger.error('Error validating audio file:', error);
        return false;
    }
};
exports.validateAudioFile = validateAudioFile;
const getAudioFileInfo = async (filePath) => {
    try {
        const metadata = await (0, exports.extractAudioMetadata)(filePath);
        return {
            isValid: true,
            metadata,
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};
exports.getAudioFileInfo = getAudioFileInfo;
const convertAudioFormat = async (inputFile, outputFile, outputFormat, quality = 'medium') => {
    return new Promise((resolve, reject) => {
        const qualitySettings = getQualitySettings(quality);
        const codec = getCodecForFormat(outputFormat);
        const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
            '-i', inputFile,
            '-c:a', codec,
            '-b:a', qualitySettings.bitrate.toString(),
            '-ar', qualitySettings.sampleRate.toString(),
            '-ac', '2',
            '-y',
            outputFile
        ]);
        let errorOutput = '';
        ffmpeg.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                logger_1.logger.error('FFmpeg conversion error:', errorOutput);
                reject(new Error(`FFmpeg failed with code ${code}`));
                return;
            }
            logger_1.logger.info(`Converted audio format: ${outputFile}`);
            resolve(outputFile);
        });
    });
};
exports.convertAudioFormat = convertAudioFormat;
const getCodecForFormat = (format) => {
    switch (format) {
        case 'mp3':
            return 'libmp3lame';
        case 'wav':
            return 'pcm_s16le';
        case 'm4a':
            return 'aac';
        case 'flac':
            return 'flac';
        default:
            return 'libmp3lame';
    }
};
const checkFFmpegAvailability = async () => {
    return new Promise((resolve) => {
        const ffmpeg = (0, child_process_1.spawn)('ffmpeg', ['-version']);
        ffmpeg.on('close', (code) => {
            resolve(code === 0);
        });
        ffmpeg.on('error', () => {
            resolve(false);
        });
    });
};
exports.checkFFmpegAvailability = checkFFmpegAvailability;
//# sourceMappingURL=audioProcessor.js.map