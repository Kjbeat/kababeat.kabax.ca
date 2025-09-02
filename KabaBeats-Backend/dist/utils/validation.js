"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validateParams = exports.validateQuery = exports.validateRequest = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            throw new errorHandler_1.CustomError(message, 400);
        }
        next();
    };
};
exports.validate = validate;
exports.validateRequest = exports.validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            throw new errorHandler_1.CustomError(message, 400);
        }
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            throw new errorHandler_1.CustomError(message, 400);
        }
        next();
    };
};
exports.validateParams = validateParams;
exports.commonSchemas = {
    mongoId: joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).max(128).required(),
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().default('-createdAt'),
    }),
    search: joi_1.default.object({
        q: joi_1.default.string().min(1).max(100),
        genre: joi_1.default.string().max(50),
        bpm: joi_1.default.number().integer().min(60).max(300),
        key: joi_1.default.string().max(10),
        priceMin: joi_1.default.number().min(0),
        priceMax: joi_1.default.number().min(0),
    }),
};
//# sourceMappingURL=validation.js.map