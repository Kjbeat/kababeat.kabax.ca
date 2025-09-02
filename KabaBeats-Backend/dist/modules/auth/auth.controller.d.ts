import { Response, NextFunction } from 'express';
import { IAuthController, AuthRequest } from './auth.interface';
export declare class AuthController implements IAuthController {
    private authService;
    constructor();
    register: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    login: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    googleCallback: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    logoutAll: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    changePassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteAccount: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateThemePreferences: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getThemePreferences: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    verifyEmailOTP: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    resendVerificationOTP: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map