"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const media_service_1 = require("./media.service");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
const cdn_1 = require("@/config/cdn");
class MediaController {
    constructor() {
        this.mediaService = new media_service_1.MediaService();
    }
    async generateUploadUrl(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { fileType, originalName, contentType, size, beatId } = req.body;
            if (!fileType || !originalName || !contentType || !size) {
                throw new errorHandler_1.CustomError('Missing required fields', 400);
            }
            if (!['audio', 'image', 'profile', 'artwork'].includes(fileType)) {
                throw new errorHandler_1.CustomError('Invalid file type', 400);
            }
            if (['audio', 'artwork'].includes(fileType) && !beatId) {
                throw new errorHandler_1.CustomError('Beat ID required for audio and artwork uploads', 400);
            }
            const uploadRequest = {
                userId,
                fileType,
                originalName,
                contentType,
                size: parseInt(size),
                beatId,
            };
            const result = await this.mediaService.generateUploadUrl(uploadRequest);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Generate upload URL error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to generate upload URL',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async confirmUpload(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { key, fileType, beatId } = req.body;
            if (!key || !fileType) {
                throw new errorHandler_1.CustomError('Missing required fields', 400);
            }
            if (!['audio', 'image', 'profile', 'artwork'].includes(fileType)) {
                throw new errorHandler_1.CustomError('Invalid file type', 400);
            }
            const mediaFile = await this.mediaService.confirmUpload(userId, key, fileType, beatId);
            const response = {
                success: true,
                data: mediaFile,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Confirm upload error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to confirm upload',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async getDownloadUrl(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { fileId } = req.params;
            const { expiresIn = 3600 } = req.query;
            if (!fileId) {
                throw new errorHandler_1.CustomError('File ID required', 400);
            }
            const downloadUrl = await this.mediaService.getDownloadUrl(userId, fileId, parseInt(expiresIn));
            const response = {
                success: true,
                data: { downloadUrl },
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Get download URL error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to get download URL',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async deleteFile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { fileId } = req.params;
            if (!fileId) {
                throw new errorHandler_1.CustomError('File ID required', 400);
            }
            await this.mediaService.deleteFile(userId, fileId);
            const response = {
                success: true,
                data: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Delete file error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to delete file',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async getUserFiles(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { fileType, beatId } = req.query;
            const files = await this.mediaService.getUserFiles(userId, fileType, beatId);
            const response = {
                success: true,
                data: files,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Get user files error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to get user files',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async updateFileMetadata(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { fileId } = req.params;
            const { title, description, tags, isPublic } = req.body;
            if (!fileId) {
                throw new errorHandler_1.CustomError('File ID required', 400);
            }
            const mediaFile = await this.mediaService.updateFileMetadata(userId, fileId, {
                title,
                description,
                tags,
                isPublic,
            });
            const response = {
                success: true,
                data: mediaFile,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Update file metadata error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to update file metadata',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async initializeChunkedUpload(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { fileName, fileSize, contentType, beatId, fileType } = req.body;
            if (!fileName || !fileSize || !contentType || !fileType) {
                throw new errorHandler_1.CustomError('Missing required fields', 400);
            }
            const session = await this.mediaService.initializeChunkedUpload({
                userId,
                fileName,
                fileSize: parseInt(fileSize),
                contentType,
                beatId,
                fileType,
            });
            const response = {
                success: true,
                data: session,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Initialize chunked upload error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to initialize chunked upload',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async generateChunkUploadUrl(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { sessionId, chunkNumber, chunkSize, totalChunks, fileName, fileSize, contentType, beatId, fileType } = req.body;
            if (!sessionId || chunkNumber === undefined || !chunkSize || !totalChunks || !fileName || !fileSize || !contentType || !fileType) {
                throw new errorHandler_1.CustomError('Missing required fields', 400);
            }
            const result = await this.mediaService.generateChunkUploadUrl({
                sessionId,
                chunkNumber: parseInt(chunkNumber),
                chunkSize: parseInt(chunkSize),
                totalChunks: parseInt(totalChunks),
                fileName,
                fileSize: parseInt(fileSize),
                contentType,
                userId,
                beatId,
                fileType,
            });
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Generate chunk upload URL error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to generate chunk upload URL',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async markChunkUploaded(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { sessionId, chunkNumber } = req.body;
            if (!sessionId || chunkNumber === undefined) {
                throw new errorHandler_1.CustomError('Missing required fields', 400);
            }
            await this.mediaService.markChunkUploaded(sessionId, parseInt(chunkNumber));
            const response = {
                success: true,
                data: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Mark chunk uploaded error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to mark chunk as uploaded',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async getUploadProgress(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { sessionId } = req.params;
            if (!sessionId) {
                throw new errorHandler_1.CustomError('Session ID required', 400);
            }
            const progress = await this.mediaService.getUploadProgress(sessionId);
            const response = {
                success: true,
                data: progress,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Get upload progress error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to get upload progress',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async completeChunkedUpload(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { sessionId, checksum } = req.body;
            if (!sessionId || !checksum) {
                throw new errorHandler_1.CustomError('Missing required fields', 400);
            }
            const result = await this.mediaService.completeChunkedUpload({
                sessionId,
                userId,
                checksum,
            });
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Complete chunked upload error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to complete chunked upload',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async abortChunkedUpload(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { sessionId } = req.params;
            if (!sessionId) {
                throw new errorHandler_1.CustomError('Session ID required', 400);
            }
            await this.mediaService.abortChunkedUpload(sessionId);
            const response = {
                success: true,
                data: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Abort chunked upload error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to abort chunked upload',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async generateHLSStreamingUrl(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { beatId } = req.params;
            const { quality } = req.query;
            if (!beatId) {
                throw new errorHandler_1.CustomError('Beat ID required', 400);
            }
            const result = await this.mediaService.generateHLSStreamingUrl(userId, beatId, quality);
            const response = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.logger.error('Generate HLS streaming URL error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to generate HLS streaming URL',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
    async getHLSPlaylist(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new errorHandler_1.CustomError('User not authenticated', 401);
            }
            const { beatId } = req.params;
            const { playlistType, quality } = req.query;
            if (!beatId || !playlistType) {
                throw new errorHandler_1.CustomError('Beat ID and playlist type required', 400);
            }
            const playlist = await this.mediaService.getHLSPlaylist(userId, beatId, playlistType, quality);
            const headers = (0, cdn_1.getCacheHeaders)('hls');
            Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            res.status(200).send(playlist);
        }
        catch (error) {
            logger_1.logger.error('Get HLS playlist error:', error);
            const response = {
                success: false,
                error: {
                    message: error instanceof errorHandler_1.CustomError ? error.message : 'Failed to get HLS playlist',
                },
            };
            res.status(error instanceof errorHandler_1.CustomError ? error.statusCode : 500).json(response);
        }
    }
}
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map