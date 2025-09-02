"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = exports.r2Client = exports.validateFileSize = exports.validateFileType = exports.generateFileKey = exports.deleteFile = exports.generatePresignedDownloadUrl = exports.generatePresignedUploadUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const logger_1 = require("@/config/logger");
const r2Client = new client_s3_1.S3Client({
    region: process.env.CLOUDFLARE_R2_REGION || 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
});
exports.r2Client = r2Client;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
exports.BUCKET_NAME = BUCKET_NAME;
const generatePresignedUploadUrl = async (key, contentType, expiresIn = 3600) => {
    try {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(r2Client, command, { expiresIn });
        logger_1.logger.info(`Generated presigned upload URL for key: ${key}`);
        return {
            uploadUrl,
            key,
            expiresIn,
        };
    }
    catch (error) {
        logger_1.logger.error('Error generating presigned upload URL:', error);
        throw new Error('Failed to generate upload URL');
    }
};
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
const generatePresignedDownloadUrl = async (key, expiresIn = 3600) => {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(r2Client, command, { expiresIn });
        logger_1.logger.info(`Generated presigned download URL for key: ${key}`);
        return downloadUrl;
    }
    catch (error) {
        logger_1.logger.error('Error generating presigned download URL:', error);
        throw new Error('Failed to generate download URL');
    }
};
exports.generatePresignedDownloadUrl = generatePresignedDownloadUrl;
const deleteFile = async (key) => {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await r2Client.send(command);
        logger_1.logger.info(`Deleted file from R2: ${key}`);
    }
    catch (error) {
        logger_1.logger.error('Error deleting file from R2:', error);
        throw new Error('Failed to delete file');
    }
};
exports.deleteFile = deleteFile;
const generateFileKey = (originalName, folder = 'uploads') => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${folder}/${timestamp}-${randomString}.${extension}`;
};
exports.generateFileKey = generateFileKey;
const validateFileType = (contentType, allowedTypes) => {
    return allowedTypes.includes(contentType);
};
exports.validateFileType = validateFileType;
const validateFileSize = (size, maxSize) => {
    return size <= maxSize;
};
exports.validateFileSize = validateFileSize;
//# sourceMappingURL=cloudflare-r2.js.map