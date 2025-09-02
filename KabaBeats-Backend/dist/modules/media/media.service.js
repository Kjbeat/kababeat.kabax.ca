"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const media_model_1 = require("./media.model");
const r2Storage_1 = require("@/utils/r2Storage");
const mediaProcessor_1 = require("@/utils/mediaProcessor");
const chunkedUpload_1 = require("@/utils/chunkedUpload");
const hlsStreaming_1 = require("@/utils/hlsStreaming");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
const auth_model_1 = require("../auth/auth.model");
const beat_model_1 = require("../beat/beat.model");
class MediaService {
    async generateUploadUrl(request) {
        try {
            const user = await auth_model_1.User.findById(request.userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (request.beatId) {
                const beat = await beat_model_1.Beat.findOne({ _id: request.beatId, userId: request.userId });
                if (!beat) {
                    throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
                }
            }
            const result = await (0, r2Storage_1.generateUploadUrl)(request);
            logger_1.logger.info(`Generated upload URL for user ${request.userId}: ${result.key}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error generating upload URL:', error);
            throw error;
        }
    }
    async confirmUpload(userId, key, fileType, beatId) {
        try {
            const user = await auth_model_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (beatId) {
                const beat = await beat_model_1.Beat.findOne({ _id: beatId, userId });
                if (!beat) {
                    throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
                }
            }
            const processingResult = await this.processUploadedFile(key, fileType);
            const mediaFile = new media_model_1.MediaFile({
                key: processingResult.originalKey,
                processedKey: processingResult.processedKey,
                thumbnailKey: processingResult.thumbnailKey,
                userId,
                beatId,
                fileType,
                metadata: processingResult.metadata,
                status: 'processed',
                uploadedAt: new Date(),
            });
            await mediaFile.save();
            logger_1.logger.info(`Confirmed upload for user ${userId}: ${key}`);
            return mediaFile;
        }
        catch (error) {
            logger_1.logger.error('Error confirming upload:', error);
            throw error;
        }
    }
    async getDownloadUrl(userId, fileId, expiresIn = 3600) {
        try {
            const mediaFile = await media_model_1.MediaFile.findOne({ _id: fileId, userId });
            if (!mediaFile) {
                throw new errorHandler_1.CustomError('File not found or access denied', 404);
            }
            const downloadUrl = await (0, r2Storage_1.generateDownloadUrl)(mediaFile.key, expiresIn);
            logger_1.logger.info(`Generated download URL for user ${userId}: ${mediaFile.key}`);
            return downloadUrl;
        }
        catch (error) {
            logger_1.logger.error('Error getting download URL:', error);
            throw error;
        }
    }
    async deleteFile(userId, fileId) {
        try {
            const mediaFile = await media_model_1.MediaFile.findOne({ _id: fileId, userId });
            if (!mediaFile) {
                throw new errorHandler_1.CustomError('File not found or access denied', 404);
            }
            await (0, r2Storage_1.deleteStorageFile)(mediaFile.key);
            if (mediaFile.processedKey) {
                await (0, r2Storage_1.deleteStorageFile)(mediaFile.processedKey);
            }
            if (mediaFile.thumbnailKey) {
                await (0, r2Storage_1.deleteStorageFile)(mediaFile.thumbnailKey);
            }
            await media_model_1.MediaFile.findByIdAndDelete(fileId);
            logger_1.logger.info(`Deleted file for user ${userId}: ${mediaFile.key}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting file:', error);
            throw error;
        }
    }
    async getUserFiles(userId, fileType, beatId) {
        try {
            const query = { userId };
            if (fileType) {
                query.fileType = fileType;
            }
            if (beatId) {
                query.beatId = beatId;
            }
            const files = await media_model_1.MediaFile.find(query).sort({ uploadedAt: -1 });
            logger_1.logger.info(`Retrieved ${files.length} files for user ${userId}`);
            return files;
        }
        catch (error) {
            logger_1.logger.error('Error getting user files:', error);
            throw error;
        }
    }
    async updateFileMetadata(userId, fileId, metadata) {
        try {
            const mediaFile = await media_model_1.MediaFile.findOne({ _id: fileId, userId });
            if (!mediaFile) {
                throw new errorHandler_1.CustomError('File not found or access denied', 404);
            }
            const allowedFields = ['title', 'description', 'tags', 'isPublic'];
            allowedFields.forEach(field => {
                if (metadata[field] !== undefined) {
                    mediaFile[field] = metadata[field];
                }
            });
            await mediaFile.save();
            logger_1.logger.info(`Updated metadata for file ${fileId}`);
            return mediaFile;
        }
        catch (error) {
            logger_1.logger.error('Error updating file metadata:', error);
            throw error;
        }
    }
    async processUploadedFile(key, fileType) {
        try {
            const contentType = this.getContentTypeFromKey(key);
            const options = this.getProcessingOptions(fileType);
            const result = await (0, mediaProcessor_1.processMediaFile)(key, contentType, options);
            logger_1.logger.info(`Processed file: ${key}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error processing uploaded file:', error);
            throw error;
        }
    }
    getContentTypeFromKey(key) {
        const extension = key.split('.').pop()?.toLowerCase();
        const contentTypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'm4a': 'audio/m4a',
            'flac': 'audio/flac',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
        };
        return contentTypes[extension || ''] || 'application/octet-stream';
    }
    getProcessingOptions(fileType) {
        switch (fileType) {
            case 'audio':
                return {
                    audio: (0, mediaProcessor_1.getAudioSettings)('full'),
                };
            case 'artwork':
                return {
                    image: {
                        quality: 90,
                        format: 'jpeg',
                        ...(0, mediaProcessor_1.getImageDimensions)('artwork'),
                        generateThumbnail: true,
                    },
                };
            case 'profile':
                return {
                    image: {
                        quality: 85,
                        format: 'jpeg',
                        ...(0, mediaProcessor_1.getImageDimensions)('profile'),
                        generateThumbnail: true,
                    },
                };
            default:
                return {};
        }
    }
    async initializeChunkedUpload(request) {
        try {
            const user = await auth_model_1.User.findById(request.userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (request.beatId) {
                const beat = await beat_model_1.Beat.findOne({ _id: request.beatId, userId: request.userId });
                if (!beat) {
                    throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
                }
            }
            const session = await (0, chunkedUpload_1.initializeChunkedUpload)(request);
            logger_1.logger.info(`Initialized chunked upload session: ${session.sessionId}`);
            return session;
        }
        catch (error) {
            logger_1.logger.error('Error initializing chunked upload:', error);
            throw error;
        }
    }
    async generateChunkUploadUrl(request) {
        try {
            const result = await (0, chunkedUpload_1.generateChunkUploadUrl)(request);
            logger_1.logger.info(`Generated chunk upload URL for session: ${request.sessionId}, chunk: ${request.chunkNumber}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error generating chunk upload URL:', error);
            throw error;
        }
    }
    async markChunkUploaded(sessionId, chunkNumber) {
        try {
            await (0, chunkedUpload_1.markChunkUploaded)(sessionId, chunkNumber);
            logger_1.logger.info(`Marked chunk ${chunkNumber} as uploaded for session: ${sessionId}`);
        }
        catch (error) {
            logger_1.logger.error('Error marking chunk as uploaded:', error);
            throw error;
        }
    }
    async getUploadProgress(sessionId) {
        try {
            const progress = await (0, chunkedUpload_1.getUploadProgress)(sessionId);
            logger_1.logger.info(`Upload progress for session ${sessionId}: ${progress.percentage}%`);
            return progress;
        }
        catch (error) {
            logger_1.logger.error('Error getting upload progress:', error);
            throw error;
        }
    }
    async completeChunkedUpload(request) {
        try {
            const result = await (0, chunkedUpload_1.completeChunkedUpload)(request);
            const session = this.getUploadSession(request.sessionId);
            if (session && session.fileType === 'audio') {
                await this.processAudioFile(result.finalKey, session);
            }
            const mediaFile = new media_model_1.MediaFile({
                key: result.finalKey,
                userId: request.userId,
                beatId: session?.beatId,
                fileType: session?.fileType || 'audio',
                metadata: {
                    format: 'audio/mpeg',
                    size: session?.fileSize || 0,
                },
                status: 'processed',
                uploadedAt: new Date(),
            });
            await mediaFile.save();
            logger_1.logger.info(`Completed chunked upload: ${result.finalKey}`);
            return {
                finalKey: result.finalKey,
                downloadUrl: result.downloadUrl,
                mediaFile,
            };
        }
        catch (error) {
            logger_1.logger.error('Error completing chunked upload:', error);
            throw error;
        }
    }
    async abortChunkedUpload(sessionId) {
        try {
            await (0, chunkedUpload_1.abortChunkedUpload)(sessionId);
            logger_1.logger.info(`Aborted chunked upload session: ${sessionId}`);
        }
        catch (error) {
            logger_1.logger.error('Error aborting chunked upload:', error);
            throw error;
        }
    }
    async generateHLSStreamingUrl(userId, beatId, quality) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, userId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            const result = await (0, hlsStreaming_1.generateHLSStreamingUrl)(userId, beatId, quality);
            logger_1.logger.info(`Generated HLS streaming URL for beat: ${beatId}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error generating HLS streaming URL:', error);
            throw error;
        }
    }
    async getHLSPlaylist(userId, beatId, playlistType, quality) {
        try {
            const beat = await beat_model_1.Beat.findOne({ _id: beatId, userId });
            if (!beat) {
                throw new errorHandler_1.CustomError('Beat not found or access denied', 404);
            }
            const playlist = await (0, hlsStreaming_1.getHLSPlaylist)(userId, beatId, playlistType, quality);
            logger_1.logger.info(`Retrieved HLS playlist: ${playlistType} for beat: ${beatId}`);
            return playlist;
        }
        catch (error) {
            logger_1.logger.error('Error getting HLS playlist:', error);
            throw error;
        }
    }
    async processAudioFile(fileKey, session) {
        try {
            const processingOptions = {
                generatePreview: true,
                previewDuration: 30,
                generateHLS: true,
                outputFormats: ['mp3'],
                quality: 'medium',
            };
            logger_1.logger.info(`Processing audio file for streaming: ${fileKey}`);
        }
        catch (error) {
            logger_1.logger.error('Error processing audio file:', error);
            throw error;
        }
    }
    getUploadSession(sessionId) {
        return null;
    }
    async cleanupOrphanedFiles() {
        try {
            const orphanedFiles = await media_model_1.MediaFile.find({
                $or: [
                    { userId: { $exists: false } },
                    { beatId: { $exists: true, $ne: null }, beat: { $exists: false } },
                ],
                uploadedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            });
            for (const file of orphanedFiles) {
                await this.deleteFile(file.userId, file._id.toString());
            }
            logger_1.logger.info(`Cleaned up ${orphanedFiles.length} orphaned files`);
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up orphaned files:', error);
            throw error;
        }
    }
}
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map