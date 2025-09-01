import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/auth';
import { CustomError } from '@/utils/errorHandler';
import { UserProfile } from '@/modules/user/user.model';
import { logger } from '@/config/logger';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access token is required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new CustomError('Access token is required', 401);
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await UserProfile.findById(decoded.userId);
    if (!user) {
      throw new CustomError('User not found', 401);
    }

    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Attach user info to request
    req.user = {
      _id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError('Invalid or expired token', 401));
    }
  }
};

export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await UserProfile.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      throw new CustomError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const producerMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!['admin', 'producer'].includes(req.user.role)) {
      throw new CustomError('Producer access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
