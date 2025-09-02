"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioSettings = exports.getImageDimensions = exports.validateImageFile = exports.validateAudioFile = exports.processMediaFile = void 0;
const logger_1 = require("@/config/logger");
const processMediaFile = async (key, contentType, options = {}) => {
    try {
        if (contentType.startsWith('audio/')) {
            return await processAudioFile(key, contentType, options.audio);
        }
        else if (contentType.startsWith('image/')) {
            return await processImageFile(key, contentType, options.image);
        }
        else {
            throw new Error(`Unsupported content type: ${contentType}`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error processing media file:', error);
        throw error;
    }
};
exports.processMediaFile = processMediaFile;
const processAudioFile = async (key, contentType, options = {}) => {
    try {
        const metadata = await extractAudioMetadata(key);
        logger_1.logger.info(`Processed audio file: ${key}`);
        return {
            originalKey: key,
            metadata: {
                ...metadata,
                format: contentType,
                size: 0,
            },
        };
    }
    catch (error) {
        logger_1.logger.error('Error processing audio file:', error);
        throw error;
    }
};
const processImageFile = async (key, contentType, options = {}) => {
    try {
        const metadata = await extractImageMetadata(key);
        let thumbnailKey;
        if (options.generateThumbnail) {
            thumbnailKey = await generateThumbnail(key, options);
        }
        logger_1.logger.info(`Processed image file: ${key}`);
        return {
            originalKey: key,
            thumbnailKey: thumbnailKey ?? "",
            metadata: {
                ...metadata,
                format: contentType,
                size: 0,
            },
        };
    }
    catch (error) {
        logger_1.logger.error('Error processing image file:', error);
        throw error;
    }
};
const extractAudioMetadata = async (key) => {
    try {
        return {
            duration: 0,
            bitrate: 128,
            sampleRate: 44100,
        };
    }
    catch (error) {
        logger_1.logger.error('Error extracting audio metadata:', error);
        return {};
    }
};
const extractImageMetadata = async (key) => {
    try {
        return {
            width: 0,
            height: 0,
        };
    }
    catch (error) {
        logger_1.logger.error('Error extracting image metadata:', error);
        return {};
    }
};
const generateThumbnail = async (key, options = {}) => {
    try {
        const thumbnailKey = key.replace('/images/', '/thumbnails/').replace(/\.[^/.]+$/, '_thumb.jpg');
        logger_1.logger.info(`Generated thumbnail: ${thumbnailKey}`);
        return thumbnailKey;
    }
    catch (error) {
        logger_1.logger.error('Error generating thumbnail:', error);
        throw error;
    }
};
const validateAudioFile = (contentType, size) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'];
    const maxSize = 50 * 1024 * 1024;
    return allowedTypes.includes(contentType) && size <= maxSize;
};
exports.validateAudioFile = validateAudioFile;
const validateImageFile = (contentType, size) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;
    return allowedTypes.includes(contentType) && size <= maxSize;
};
exports.validateImageFile = validateImageFile;
const getImageDimensions = (useCase) => {
    switch (useCase) {
        case 'profile':
            return { width: 400, height: 400 };
        case 'artwork':
            return { width: 1200, height: 1200 };
        case 'thumbnail':
            return { width: 300, height: 300 };
        default:
            return { width: 800, height: 600 };
    }
};
exports.getImageDimensions = getImageDimensions;
const getAudioSettings = (useCase) => {
    switch (useCase) {
        case 'preview':
            return { quality: 'low', bitrate: 64 };
        case 'full':
            return { quality: 'medium', bitrate: 128 };
        case 'download':
            return { quality: 'high', bitrate: 320 };
        default:
            return { quality: 'medium', bitrate: 128 };
    }
};
exports.getAudioSettings = getAudioSettings;
//# sourceMappingURL=mediaProcessor.js.map