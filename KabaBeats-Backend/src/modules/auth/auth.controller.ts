import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { IAuthController, AuthRequest } from './auth.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { ApiResponse } from '@/types';

export class AuthController implements IAuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  loginWithGoogle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.loginWithGoogle(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        throw new CustomError('Authorization code not provided', 400);
      }

      const result = await this.authService.handleGoogleCallback(code as string, state as string);
      
      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      
      // Redirect to frontend with error
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=authentication_failed`;
      res.redirect(errorUrl);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      const result = await this.authService.refreshToken(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      await this.authService.logout(userId, refreshToken);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Logged out successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      await this.authService.logoutAll(userId);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Logged out from all devices successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomError('Email is required', 400);
      }

      await this.authService.forgotPassword(email);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Password reset email sent if account exists' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new CustomError('Token and password are required', 400);
      }

      await this.authService.resetPassword(token, password);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Password reset successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!currentPassword || !newPassword) {
        throw new CustomError('Current password and new password are required', 400);
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Password changed successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new CustomError('Verification token is required', 400);
      }

      await this.authService.verifyEmail(token);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Email verified successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomError('Email is required', 400);
      }

      await this.authService.resendVerificationEmail(email);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Verification email sent' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await this.authService.getProfile(userId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await this.authService.updateProfile(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { password } = req.body;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!password) {
        throw new CustomError('Password is required to delete account', 400);
      }

      await this.authService.deleteAccount(userId, password);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Account deleted successfully' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateThemePreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { themePreferences } = req.body;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      if (!themePreferences) {
        throw new CustomError('Theme preferences are required', 400);
      }

      const user = await this.authService.updateThemePreferences(userId, themePreferences);
      
      const response: ApiResponse = {
        success: true,
        data: { user },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getThemePreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const themePreferences = await this.authService.getThemePreferences(userId);
      
      const response: ApiResponse = {
        success: true,
        data: { themePreferences },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  verifyEmailOTP = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        throw new CustomError('Email and OTP are required', 400);
      }

      const result = await this.authService.verifyEmailOTP(email, otp);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resendVerificationOTP = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new CustomError('Email is required', 400);
      }

      await this.authService.resendVerificationOTP(email);
      
      const response: ApiResponse = {
        success: true,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
