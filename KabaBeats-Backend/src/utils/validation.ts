import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(message, 400);
    }
    
    next();
  };
};

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
