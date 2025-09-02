"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOptimalChunkSize = exports.cleanupExpiredSessions = exports.abortChunkedUpload = exports.completeChunkedUpload = exports.getUploadProgress = exports.isUploadComplete = exports.markChunkUploaded = exports.generateChunkUploadUrl = exports.initializeChunkedUpload = exports.CHUNK_CONFIG = void 0;
const cloudflare_r2_1 = require("@/config/cloudflare-r2");
const logger_1 = require("@/config/logger");
const redis_1 = require("@/config/redis");
const crypto_1 = __importDefault(require("crypto"));
const uploadSessions = new Map();
exports.CHUNK_CONFIG = {
    DEFAULT_CHUNK_SIZE: 5 * 1024 * 1024,
    MIN_CHUNK_SIZE: 1024 * 1024,
    MAX_CHUNK_SIZE: 10 * 1024 * 1024,
    MAX_FILE_SIZE: 500 * 1024 * 1024,
    SESSION_EXPIRY: 24 * 60 * 60 * 1000,
};
const initializeChunkedUpload = async (request) => {
    try {
        if (request.fileSize > exports.CHUNK_CONFIG.MAX_FILE_SIZE) {
            throw new Error(`File too large. Maximum size: ${exports.CHUNK_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        const chunkSize = Math.min(request.chunkSize || exports.CHUNK_CONFIG.DEFAULT_CHUNK_SIZE, exports.CHUNK_CONFIG.MAX_CHUNK_SIZE);
        const totalChunks = Math.ceil(request.fileSize / chunkSize);
        const sessionId = generateSessionId();
        const session = {
            sessionId,
            userId: request.userId,
            fileName: request.fileName,
            fileSize: request.fileSize,
            chunkSize,
            totalChunks,
            uploadedChunks: new Set(),
            contentType: request.contentType,
            beatId: request.beatId || undefined,
            fileType: request.fileType,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + exports.CHUNK_CONFIG.SESSION_EXPIRY),
        };
        if (redis_1.redisService.isClientConnected()) {
            await redis_1.redisService.setChunkedUploadSession(sessionId, session, exports.CHUNK_CONFIG.SESSION_EXPIRY / 1000);
        }
        else {
            uploadSessions.set(sessionId, session);
        }
        logger_1.logger.info(`Initialized chunked upload session: ${sessionId} for file: ${request.fileName}`);
        return session;
    }
    catch (error) {
        logger_1.logger.error('Error initializing chunked upload:', error);
        throw error;
    }
};
exports.initializeChunkedUpload = initializeChunkedUpload;
const generateChunkUploadUrl = async (request) => {
    try {
        let session = null;
        if (redis_1.redisService.isClientConnected()) {
            session = await redis_1.redisService.getChunkedUploadSession(request.sessionId);
        }
        else {
            session = uploadSessions.get(request.sessionId) || null;
        }
        if (!session) {
            throw new Error('Upload session not found or expired');
        }
        if (session.userId !== request.userId) {
            throw new Error('Unauthorized access to upload session');
        }
        if (new Date() > session.expiresAt) {
            uploadSessions.delete(request.sessionId);
            throw new Error('Upload session expired');
        }
        if (request.chunkNumber < 0 || request.chunkNumber >= session.totalChunks) {
            throw new Error('Invalid chunk number');
        }
        const chunkKey = generateChunkKey(session, request.chunkNumber);
        const result = await (0, cloudflare_r2_1.generatePresignedUploadUrl)(chunkKey, request.contentType, 3600);
        logger_1.logger.info(`Generated chunk upload URL: ${chunkKey}`);
        return {
            uploadUrl: result.uploadUrl,
            chunkKey: result.key,
            expiresIn: result.expiresIn,
        };
    }
    catch (error) {
        logger_1.logger.error('Error generating chunk upload URL:', error);
        throw error;
    }
};
exports.generateChunkUploadUrl = generateChunkUploadUrl;
const markChunkUploaded = async (sessionId, chunkNumber) => {
    try {
        let session = null;
        if (redis_1.redisService.isClientConnected()) {
            session = await redis_1.redisService.getChunkedUploadSession(sessionId);
        }
        else {
            session = uploadSessions.get(sessionId) || null;
        }
        if (!session) {
            throw new Error('Upload session not found');
        }
        session.uploadedChunks.add(chunkNumber);
        if (redis_1.redisService.isClientConnected()) {
            await redis_1.redisService.setChunkedUploadSession(sessionId, session, exports.CHUNK_CONFIG.SESSION_EXPIRY / 1000);
        }
        else {
            uploadSessions.set(sessionId, session);
        }
        logger_1.logger.info(`Marked chunk ${chunkNumber} as uploaded for session: ${sessionId}`);
    }
    catch (error) {
        logger_1.logger.error('Error marking chunk as uploaded:', error);
        throw error;
    }
};
exports.markChunkUploaded = markChunkUploaded;
const isUploadComplete = async (sessionId) => {
    try {
        let session = null;
        if (redis_1.redisService.isClientConnected()) {
            session = await redis_1.redisService.getChunkedUploadSession(sessionId);
        }
        else {
            session = uploadSessions.get(sessionId) || null;
        }
        if (!session) {
            return false;
        }
        return session.uploadedChunks.size === session.totalChunks;
    }
    catch (error) {
        logger_1.logger.error('Error checking upload completion:', error);
        return false;
    }
};
exports.isUploadComplete = isUploadComplete;
const getUploadProgress = async (sessionId) => {
    try {
        let session = null;
        if (redis_1.redisService.isClientConnected()) {
            session = await redis_1.redisService.getChunkedUploadSession(sessionId);
        }
        else {
            session = uploadSessions.get(sessionId) || null;
        }
        if (!session) {
            throw new Error('Upload session not found');
        }
        const uploaded = session.uploadedChunks.size;
        const total = session.totalChunks;
        const percentage = Math.round((uploaded / total) * 100);
        return { uploaded, total, percentage };
    }
    catch (error) {
        logger_1.logger.error('Error getting upload progress:', error);
        throw error;
    }
};
exports.getUploadProgress = getUploadProgress;
const completeChunkedUpload = async (request) => {
    try {
        let session = null;
        if (redis_1.redisService.isClientConnected()) {
            session = await redis_1.redisService.getChunkedUploadSession(request.sessionId);
        }
        else {
            session = uploadSessions.get(request.sessionId) || null;
        }
        if (!session) {
            throw new Error('Upload session not found or expired');
        }
        if (!(await (0, exports.isUploadComplete)(request.sessionId))) {
            throw new Error('Not all chunks have been uploaded');
        }
        const finalKey = generateFinalFileKey(session);
        logger_1.logger.info(`Completing chunked upload for session: ${request.sessionId}`);
        if (redis_1.redisService.isClientConnected()) {
            await redis_1.redisService.deleteChunkedUploadSession(request.sessionId);
        }
        else {
            uploadSessions.delete(request.sessionId);
        }
        const downloadUrl = await (0, cloudflare_r2_1.generatePresignedDownloadUrl)(finalKey, 3600);
        logger_1.logger.info(`Chunked upload completed: ${finalKey}`);
        return {
            finalKey,
            downloadUrl,
        };
    }
    catch (error) {
        logger_1.logger.error('Error completing chunked upload:', error);
        throw error;
    }
};
exports.completeChunkedUpload = completeChunkedUpload;
const abortChunkedUpload = async (sessionId) => {
    try {
        let session = null;
        if (redis_1.redisService.isClientConnected()) {
            session = await redis_1.redisService.getChunkedUploadSession(sessionId);
        }
        else {
            session = uploadSessions.get(sessionId) || null;
        }
        if (!session) {
            return;
        }
        for (let i = 0; i < session.totalChunks; i++) {
            const chunkKey = generateChunkKey(session, i);
            try {
                await (0, cloudflare_r2_1.deleteFile)(chunkKey);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to delete chunk: ${chunkKey}`, error);
            }
        }
        if (redis_1.redisService.isClientConnected()) {
            await redis_1.redisService.deleteChunkedUploadSession(sessionId);
        }
        else {
            uploadSessions.delete(sessionId);
        }
        logger_1.logger.info(`Aborted chunked upload session: ${sessionId}`);
    }
    catch (error) {
        logger_1.logger.error('Error aborting chunked upload:', error);
        throw error;
    }
};
exports.abortChunkedUpload = abortChunkedUpload;
const cleanupExpiredSessions = async () => {
    try {
        if (redis_1.redisService.isClientConnected()) {
            await redis_1.redisService.cleanupExpiredSessions();
        }
        else {
            const now = new Date();
            const expiredSessions = [];
            for (const [sessionId, session] of uploadSessions.entries()) {
                if (now > session.expiresAt) {
                    expiredSessions.push(sessionId);
                }
            }
            for (const sessionId of expiredSessions) {
                uploadSessions.delete(sessionId);
            }
            if (expiredSessions.length > 0) {
                logger_1.logger.info(`Cleaned up ${expiredSessions.length} expired upload sessions`);
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Error cleaning up expired sessions:', error);
    }
};
exports.cleanupExpiredSessions = cleanupExpiredSessions;
const generateSessionId = () => {
    return crypto_1.default.randomBytes(16).toString('hex');
};
const generateChunkKey = (session, chunkNumber) => {
    const timestamp = session.createdAt.getTime();
    return `temp/chunks/${session.userId}/${session.sessionId}/${timestamp}-chunk-${chunkNumber}`;
};
const generateFinalFileKey = (session) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = session.fileName.split('.').pop();
    switch (session.fileType) {
        case 'audio':
            if (!session.beatId)
                throw new Error('Beat ID required for audio uploads');
            return `audio/beats/${session.userId}/${session.beatId}/${timestamp}-${randomString}.${extension}`;
        case 'artwork':
            if (!session.beatId)
                throw new Error('Beat ID required for artwork uploads');
            return `images/artwork/${session.userId}/${session.beatId}/${timestamp}-${randomString}.${extension}`;
        case 'profile':
            return `images/profiles/${session.userId}/${timestamp}-${randomString}.${extension}`;
        case 'image':
            return `temp/${session.userId}/${timestamp}-${randomString}.${extension}`;
        default:
            throw new Error(`Unknown file type: ${session.fileType}`);
    }
};
const calculateOptimalChunkSize = (fileSize) => {
    if (fileSize < 10 * 1024 * 1024) {
        return exports.CHUNK_CONFIG.MIN_CHUNK_SIZE;
    }
    else if (fileSize < 100 * 1024 * 1024) {
        return exports.CHUNK_CONFIG.DEFAULT_CHUNK_SIZE;
    }
    else {
        return exports.CHUNK_CONFIG.MAX_CHUNK_SIZE;
    }
};
exports.calculateOptimalChunkSize = calculateOptimalChunkSize;
setInterval(exports.cleanupExpiredSessions, 60 * 60 * 1000);
//# sourceMappingURL=chunkedUpload.js.map