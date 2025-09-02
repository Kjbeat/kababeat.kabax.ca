"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            try {
                const result = await this.authService.register(req.body);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(201).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.googleCallback = async (req, res, next) => {
            try {
                const { code, state, username, country, themePreferences } = req.query;
                logger_1.logger.info('Google OAuth callback received query params:', {
                    code: code ? 'present' : 'missing',
                    state: state ? 'present' : 'missing',
                    username,
                    country,
                    themePreferences: themePreferences ? 'present' : 'missing'
                });
                if (!code) {
                    throw new errorHandler_1.CustomError('Authorization code not provided', 400);
                }
                let oauthData = {};
                if (username) {
                    oauthData.username = username;
                }
                if (country) {
                    oauthData.country = country;
                }
                if (themePreferences) {
                    try {
                        oauthData.themePreferences = JSON.parse(themePreferences);
                    }
                    catch (error) {
                        logger_1.logger.warn('Failed to parse theme preferences from OAuth callback:', error);
                    }
                }
                const result = await this.authService.handleGoogleCallback(code, state, oauthData);
                const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
                res.redirect(redirectUrl);
            }
            catch (error) {
                logger_1.logger.error('Google OAuth callback error:', error);
                const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=authentication_failed`;
                res.redirect(errorUrl);
            }
        };
        this.refreshToken = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    throw new errorHandler_1.CustomError('Refresh token is required', 400);
                }
                const result = await this.authService.refreshToken(refreshToken);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!refreshToken) {
                    throw new errorHandler_1.CustomError('Refresh token is required', 400);
                }
                await this.authService.logout(userId, refreshToken);
                const response = {
                    success: true,
                    data: { message: 'Logged out successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.logoutAll = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                await this.authService.logoutAll(userId);
                const response = {
                    success: true,
                    data: { message: 'Logged out from all devices successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                if (!email) {
                    throw new errorHandler_1.CustomError('Email is required', 400);
                }
                const result = await this.authService.forgotPassword(email);
                if (result.success) {
                    const response = {
                        success: true,
                        data: { message: result.message },
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        data: { message: result.message },
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const { token, password } = req.body;
                if (!token || !password) {
                    throw new errorHandler_1.CustomError('Token and password are required', 400);
                }
                await this.authService.resetPassword(token, password);
                const response = {
                    success: true,
                    data: { message: 'Password reset successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.changePassword = async (req, res, next) => {
            try {
                const { currentPassword, newPassword } = req.body;
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!currentPassword || !newPassword) {
                    throw new errorHandler_1.CustomError('Current password and new password are required', 400);
                }
                await this.authService.changePassword(userId, currentPassword, newPassword);
                const response = {
                    success: true,
                    data: { message: 'Password changed successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getProfile = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const user = await this.authService.getProfile(userId);
                const response = {
                    success: true,
                    data: user,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const user = await this.authService.updateProfile(userId, req.body);
                const response = {
                    success: true,
                    data: user,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteAccount = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                const { password } = req.body;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!password) {
                    throw new errorHandler_1.CustomError('Password is required to delete account', 400);
                }
                await this.authService.deleteAccount(userId, password);
                const response = {
                    success: true,
                    data: { message: 'Account deleted successfully' },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateThemePreferences = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                const { themePreferences } = req.body;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                if (!themePreferences) {
                    throw new errorHandler_1.CustomError('Theme preferences are required', 400);
                }
                const user = await this.authService.updateThemePreferences(userId, themePreferences);
                const response = {
                    success: true,
                    data: { user },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getThemePreferences = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    throw new errorHandler_1.CustomError('User not authenticated', 401);
                }
                const themePreferences = await this.authService.getThemePreferences(userId);
                const response = {
                    success: true,
                    data: { themePreferences },
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyEmailOTP = async (req, res, next) => {
            try {
                const { email, otp } = req.body;
                if (!email || !otp) {
                    throw new errorHandler_1.CustomError('Email and OTP are required', 400);
                }
                const result = await this.authService.verifyEmailOTP(email, otp);
                const response = {
                    success: true,
                    data: result,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.resendVerificationOTP = async (req, res, next) => {
            try {
                const { email } = req.body;
                if (!email) {
                    throw new errorHandler_1.CustomError('Email is required', 400);
                }
                await this.authService.resendVerificationOTP(email);
                const response = {
                    success: true,
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map