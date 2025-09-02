"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtensionFromContentType = exports.sanitizeFilename = exports.generatePublicUrl = exports.parseFileKey = exports.cleanupTempFiles = exports.deleteStorageFile = exports.generateDownloadUrl = exports.generateUploadUrl = exports.STORAGE_PATHS = exports.FILE_TYPES = void 0;
const cloudflare_r2_1 = require("@/config/cloudflare-r2");
const logger_1 = require("@/config/logger");
exports.FILE_TYPES = {
    AUDIO: {
        allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'],
        maxSize: 150 * 1024 * 1024,
        folder: 'audio',
    },
    IMAGE: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 25 * 1024 * 1024,
        folder: 'images',
    },
    PROFILE_IMAGE: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024,
        folder: 'profiles',
    },
    BEAT_ARTWORK: {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 25 * 1024 * 1024,
        folder: 'artwork',
    },
};
exports.STORAGE_PATHS = {
    BEAT_AUDIO: (userId, beatId, filename) => `audio/beats/${userId}/${beatId}/${filename}`,
    BEAT_ARTWORK: (userId, beatId, filename) => `images/artwork/${userId}/${beatId}/${filename}`,
    PROFILE_IMAGE: (userId, filename) => `images/profiles/${userId}/${filename}`,
    TEMP_UPLOAD: (userId, filename) => `temp/${userId}/${filename}`,
    PROCESSED_AUDIO: (userId, beatId, filename) => `processed/audio/${userId}/${beatId}/${filename}`,
};
const generateUploadUrl = async (request) => {
    try {
        const config = getFileConfig(request.fileType);
        if (!(0, cloudflare_r2_1.validateFileType)(request.contentType, config.allowedTypes)) {
            throw new Error(`Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`);
        }
        if (!(0, cloudflare_r2_1.validateFileSize)(request.size, config.maxSize)) {
            throw new Error(`File too large. Maximum size: ${config.maxSize / (1024 * 1024)}MB`);
        }
        const key = generateFileKey(request);
        const result = await (0, cloudflare_r2_1.generatePresignedUploadUrl)(key, request.contentType, 3600);
        logger_1.logger.info(`Generated upload URL for ${request.fileType}: ${key}`);
        return {
            uploadUrl: result.uploadUrl,
            key: result.key,
            expiresIn: result.expiresIn,
        };
    }
    catch (error) {
        logger_1.logger.error('Error generating upload URL:', error);
        throw error;
    }
};
exports.generateUploadUrl = generateUploadUrl;
const generateDownloadUrl = async (key, expiresIn = 3600) => {
    try {
        const downloadUrl = await (0, cloudflare_r2_1.generatePresignedDownloadUrl)(key, expiresIn);
        logger_1.logger.info(`Generated download URL for: ${key}`);
        return downloadUrl;
    }
    catch (error) {
        logger_1.logger.error('Error generating download URL:', error);
        throw error;
    }
};
exports.generateDownloadUrl = generateDownloadUrl;
const deleteStorageFile = async (key) => {
    try {
        await (0, cloudflare_r2_1.deleteFile)(key);
        logger_1.logger.info(`Deleted file from storage: ${key}`);
    }
    catch (error) {
        logger_1.logger.error('Error deleting file from storage:', error);
        throw error;
    }
};
exports.deleteStorageFile = deleteStorageFile;
const generateFileKey = (request) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = request.originalName.split('.').pop();
    switch (request.fileType) {
        case 'audio':
            if (!request.beatId)
                throw new Error('Beat ID required for audio uploads');
            return exports.STORAGE_PATHS.BEAT_AUDIO(request.userId, request.beatId, `${timestamp}-${randomString}.${extension}`);
        case 'artwork':
            if (!request.beatId)
                throw new Error('Beat ID required for artwork uploads');
            return exports.STORAGE_PATHS.BEAT_ARTWORK(request.userId, request.beatId, `${timestamp}-${randomString}.${extension}`);
        case 'profile':
            return exports.STORAGE_PATHS.PROFILE_IMAGE(request.userId, `${timestamp}-${randomString}.${extension}`);
        case 'image':
            return exports.STORAGE_PATHS.TEMP_UPLOAD(request.userId, `${timestamp}-${randomString}.${extension}`);
        default:
            throw new Error(`Unknown file type: ${request.fileType}`);
    }
};
const getFileConfig = (fileType) => {
    switch (fileType) {
        case 'audio':
            return exports.FILE_TYPES.AUDIO;
        case 'image':
            return exports.FILE_TYPES.IMAGE;
        case 'profile':
            return exports.FILE_TYPES.PROFILE_IMAGE;
        case 'artwork':
            return exports.FILE_TYPES.BEAT_ARTWORK;
        default:
            throw new Error(`Unknown file type: ${fileType}`);
    }
};
const cleanupTempFiles = async (olderThanHours = 24) => {
    try {
        logger_1.logger.info(`Cleanup temp files older than ${olderThanHours} hours`);
    }
    catch (error) {
        logger_1.logger.error('Error cleaning up temp files:', error);
        throw error;
    }
};
exports.cleanupTempFiles = cleanupTempFiles;
const parseFileKey = (key) => {
    try {
        const parts = key.split('/');
        if (parts.length < 3)
            return null;
        const [type, subfolder, userId, ...rest] = parts;
        const filename = rest[rest.length - 1];
        if (!filename)
            return null;
        const [timestamp, randomString, extension] = filename.split('.')[0]?.split('-') || [];
        return {
            key,
            size: 0,
            contentType: '',
            uploadedAt: new Date(parseInt(timestamp || '0')),
            userId: userId || '',
            beatId: type === 'audio' || type === 'artwork' ? rest[0] : undefined,
        };
    }
    catch (error) {
        logger_1.logger.error('Error parsing file key:', error);
        return null;
    }
};
exports.parseFileKey = parseFileKey;
const generatePublicUrl = (key) => {
    const bucketUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_ENDPOINT;
    return `${bucketUrl}/${key}`;
};
exports.generatePublicUrl = generatePublicUrl;
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
};
exports.sanitizeFilename = sanitizeFilename;
const getExtensionFromContentType = (contentType) => {
    const extensions = {
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/mp3': 'mp3',
        'audio/m4a': 'm4a',
        'audio/flac': 'flac',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
    };
    return extensions[contentType] || 'bin';
};
exports.getExtensionFromContentType = getExtensionFromContentType;
//# sourceMappingURL=r2Storage.js.map