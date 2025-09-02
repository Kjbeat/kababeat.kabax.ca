import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Preprocess req.body to handle FormData JSON strings
    const processedBody = { ...req.body };
    
    // Convert JSON strings to objects/arrays for specific fields
    if (processedBody.tags && typeof processedBody.tags === 'string') {
      try {
        processedBody.tags = JSON.parse(processedBody.tags);
      } catch (e) {
        // If parsing fails, keep as string - validation will catch it
      }
    }
    
    // Convert string numbers to numbers
    if (processedBody.bpm && typeof processedBody.bpm === 'string') {
      processedBody.bpm = parseInt(processedBody.bpm);
    }
    if (processedBody.basePrice && typeof processedBody.basePrice === 'string') {
      processedBody.basePrice = parseFloat(processedBody.basePrice);
    }
    if (processedBody.salePrice && typeof processedBody.salePrice === 'string') {
      processedBody.salePrice = parseFloat(processedBody.salePrice);
    }
    
    // Convert string booleans to booleans
    if (processedBody.isExclusive && typeof processedBody.isExclusive === 'string') {
      processedBody.isExclusive = processedBody.isExclusive === 'true';
    }
    if (processedBody.allowFreeDownload && typeof processedBody.allowFreeDownload === 'string') {
      processedBody.allowFreeDownload = processedBody.allowFreeDownload === 'true';
    }
    
    const { error } = schema.validate(processedBody);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(message, 400);
    }
    
    // Update req.body with processed data
    req.body = processedBody;
    next();
  };
};

/**
 * Alias for backward compatibility
 */
export const validateRequest = validate;

/**
 * Validation middleware for query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(message, 400);
    }
    
    next();
  };
};

/**
 * Validation middleware for URL parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(message, 400);
    }
    
    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  mongoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('-createdAt'),
  }),
  search: Joi.object({
    q: Joi.string().min(1).max(100),
    genre: Joi.string().max(50),
    bpm: Joi.number().integer().min(60).max(300),
    key: Joi.string().max(10),
    priceMin: Joi.number().min(0),
    priceMax: Joi.number().min(0),
  }),
};
