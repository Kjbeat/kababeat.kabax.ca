"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.producerMiddleware = exports.adminMiddleware = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const auth_1 = require("@/utils/auth");
const errorHandler_1 = require("@/utils/errorHandler");
const user_model_1 = require("@/modules/user/user.model");
const logger_1 = require("@/config/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.CustomError('Access token is required', 401);
        }
        const token = authHeader.substring(7);
        if (!token) {
            throw new errorHandler_1.CustomError('Access token is required', 401);
        }
        const decoded = (0, auth_1.verifyToken)(token);
        const user = await user_model_1.UserProfile.findById(decoded.userId);
        if (!user) {
            throw new errorHandler_1.CustomError('User not found', 401);
        }
        if (!user.isActive) {
            throw new errorHandler_1.CustomError('Account is deactivated', 401);
        }
        req.user = {
            _id: user._id.toString(),
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        if (error instanceof errorHandler_1.CustomError) {
            next(error);
        }
        else {
            next(new errorHandler_1.CustomError('Invalid or expired token', 401));
        }
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        if (!token) {
            return next();
        }
        const decoded = (0, auth_1.verifyToken)(token);
        const user = await user_model_1.UserProfile.findById(decoded.userId);
        if (user && user.isActive) {
            req.user = {
                _id: user._id.toString(),
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.CustomError('Authentication required', 401);
        }
        if (req.user.role !== 'admin') {
            throw new errorHandler_1.CustomError('Admin access required', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.adminMiddleware = adminMiddleware;
const producerMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.CustomError('Authentication required', 401);
        }
        if (!['admin', 'producer'].includes(req.user.role)) {
            throw new errorHandler_1.CustomError('Producer access required', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.producerMiddleware = producerMiddleware;
exports.authenticateToken = exports.authMiddleware;
//# sourceMappingURL=auth.js.map