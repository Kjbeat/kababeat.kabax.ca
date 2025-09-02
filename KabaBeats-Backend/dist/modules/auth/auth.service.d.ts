import { IAuthService, LoginCredentials, RegisterData, AuthResponse } from './auth.interface';
import { IUser } from '@/types';
export declare class AuthService implements IAuthService {
    register(data: RegisterData): Promise<AuthResponse>;
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    handleGoogleCallback(code: string, state?: string, oauthData?: {
        username?: string;
        country?: string;
        themePreferences?: any;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshToken: string): Promise<AuthResponse>;
    logout(userId: string, refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, password: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
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
    verifyEmailOTP(email: string, otp: string): Promise<AuthResponse>;
    resendVerificationOTP(email: string): Promise<void>;
    private sanitizeUser;
}
//# sourceMappingURL=auth.service.d.ts.map