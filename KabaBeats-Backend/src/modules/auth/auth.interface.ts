import { Request } from 'express';
import { IUser } from '@/types';
import { JwtPayload } from '@/utils/auth';

// Request interfaces
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Auth service interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  themePreferences?: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  };
}

export interface GoogleAuthData {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  country?: string;
  themePreferences?: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  };
}

export interface AuthResponse {
  user: Omit<IUser, 'password' | 'refreshTokens'>;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// Auth service methods interface
export interface IAuthService {
  register(data: RegisterData): Promise<AuthResponse>;
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  loginWithGoogle(data: GoogleAuthData): Promise<AuthResponse>;
  handleGoogleCallback(code: string, state?: string): Promise<{ accessToken: string; refreshToken: string }>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(userId: string, refreshToken: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerificationEmail(email: string): Promise<void>;
  getProfile(userId: string): Promise<Omit<IUser, 'password' | 'refreshTokens'>>;
  updateProfile(userId: string, data: Partial<IUser>): Promise<Omit<IUser, 'password' | 'refreshTokens'>>;
  deleteAccount(userId: string, password: string): Promise<void>;
  updateThemePreferences(userId: string, themePreferences: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  }): Promise<Omit<IUser, 'password' | 'refreshTokens'>>;
  getThemePreferences(userId: string): Promise<{
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  } | null>;
}

// Auth controller methods interface
export interface IAuthController {
  register(req: AuthRequest, res: any, next: any): Promise<void>;
  login(req: AuthRequest, res: any, next: any): Promise<void>;
  loginWithGoogle(req: AuthRequest, res: any, next: any): Promise<void>;
  googleCallback(req: AuthRequest, res: any, next: any): Promise<void>;
  refreshToken(req: AuthRequest, res: any, next: any): Promise<void>;
  logout(req: AuthRequest, res: any, next: any): Promise<void>;
  logoutAll(req: AuthRequest, res: any, next: any): Promise<void>;
  forgotPassword(req: AuthRequest, res: any, next: any): Promise<void>;
  resetPassword(req: AuthRequest, res: any, next: any): Promise<void>;
  changePassword(req: AuthRequest, res: any, next: any): Promise<void>;
  verifyEmail(req: AuthRequest, res: any, next: any): Promise<void>;
  resendVerificationEmail(req: AuthRequest, res: any, next: any): Promise<void>;
  getProfile(req: AuthRequest, res: any, next: any): Promise<void>;
  updateProfile(req: AuthRequest, res: any, next: any): Promise<void>;
  deleteAccount(req: AuthRequest, res: any, next: any): Promise<void>;
  updateThemePreferences(req: AuthRequest, res: any, next: any): Promise<void>;
  getThemePreferences(req: AuthRequest, res: any, next: any): Promise<void>;
}
