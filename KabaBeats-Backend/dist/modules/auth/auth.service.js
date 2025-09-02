"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_model_1 = require("./auth.model");
const errorHandler_1 = require("@/utils/errorHandler");
const logger_1 = require("@/config/logger");
const auth_1 = require("@/utils/auth");
const emailService_1 = require("@/utils/emailService");
const otpGenerator_1 = require("@/utils/otpGenerator");
const passwordResetToken_1 = require("@/utils/passwordResetToken");
class AuthService {
    async register(data) {
        try {
            console.log('AuthService: Received registration data:', {
                email: data.email,
                username: data.username,
                country: data.country,
                themePreferences: data.themePreferences
            });
            const existingUser = await auth_model_1.User.findOne({
                $or: [{ email: data.email }, { username: data.username }]
            });
            if (existingUser) {
                if (existingUser.email === data.email) {
                    throw new errorHandler_1.CustomError('Email already registered', 400);
                }
                if (existingUser.username === data.username) {
                    throw new errorHandler_1.CustomError('Username already taken', 400);
                }
            }
            const otp = (0, otpGenerator_1.generateOTP)();
            const otpExpiration = (0, otpGenerator_1.generateOTPExpiration)();
            const user = new auth_model_1.User({
                ...data,
                role: 'creator',
                isVerified: false,
                isActive: true,
                refreshTokens: [],
                emailVerificationOTP: otp,
                emailVerificationExpires: otpExpiration,
            });
            console.log('AuthService: Creating user with data:', {
                email: user.email,
                username: user.username,
                country: user.country,
                themePreferences: user.themePreferences
            });
            await user.save();
            console.log('AuthService: User created successfully with ID:', user._id);
            try {
                await emailService_1.emailService.sendEmail({
                    to: user.email,
                    subject: 'Verify Your KabaBeats Account',
                    html: emailService_1.emailService.generateOTPEmailHTML(otp, user.username, user.email),
                    text: emailService_1.emailService.generateOTPEmailText(otp, user.username, user.email),
                });
                logger_1.logger.info(`Verification email sent to ${user.email}`);
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send verification email:', emailError);
            }
            const accessToken = (0, auth_1.generateToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, auth_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            await user.addRefreshToken(refreshToken);
            user.lastLogin = new Date();
            await user.save();
            logger_1.logger.info(`New user registered: ${user.email}`);
            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            throw error;
        }
    }
    async login(credentials) {
        try {
            const user = await auth_model_1.User.findOne({ email: credentials.email }).select('+password');
            if (!user) {
                throw new errorHandler_1.CustomError('Invalid email or password', 401);
            }
            if (!user.isActive) {
                throw new errorHandler_1.CustomError('Account is deactivated', 401);
            }
            if (!user.isVerified) {
                const otp = (0, otpGenerator_1.generateOTP)();
                const otpExpiration = (0, otpGenerator_1.generateOTPExpiration)();
                user.emailVerificationOTP = otp;
                user.emailVerificationExpires = otpExpiration;
                await user.save();
                try {
                    await emailService_1.emailService.sendEmail({
                        to: user.email,
                        subject: 'Verify Your KabaBeats Account',
                        html: emailService_1.emailService.generateOTPEmailHTML(otp, user.username, user.email),
                        text: emailService_1.emailService.generateOTPEmailText(otp, user.username, user.email),
                    });
                    logger_1.logger.info(`Verification email sent to unverified user: ${user.email}`);
                }
                catch (emailError) {
                    logger_1.logger.error('Failed to send verification email to unverified user:', emailError);
                }
                throw new errorHandler_1.CustomError('Email not verified. Please check your email for verification code.', 401);
            }
            const isPasswordValid = await user.comparePassword(credentials.password);
            if (!isPasswordValid) {
                throw new errorHandler_1.CustomError('Invalid email or password', 401);
            }
            const accessToken = (0, auth_1.generateToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, auth_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            await user.addRefreshToken(refreshToken);
            user.lastLogin = new Date();
            if (credentials.country) {
                user.country = credentials.country;
                logger_1.logger.info(`Updated location for user ${user.email}: ${credentials.country}`);
            }
            await user.save();
            logger_1.logger.info(`User logged in: ${user.email}`);
            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            throw error;
        }
    }
    async handleGoogleCallback(code, state, oauthData) {
        try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                }),
            });
            if (!tokenResponse.ok) {
                throw new errorHandler_1.CustomError('Failed to exchange authorization code', 400);
            }
            const tokenData = await tokenResponse.json();
            const { access_token } = tokenData;
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            if (!userResponse.ok) {
                throw new errorHandler_1.CustomError('Failed to get user info from Google', 400);
            }
            const googleUser = await userResponse.json();
            logger_1.logger.info('Google OAuth callback received data:', {
                email: googleUser.email,
                oauthData: oauthData
            });
            let user = await auth_model_1.User.findOne({ email: googleUser.email });
            if (!user) {
                user = new auth_model_1.User({
                    email: googleUser.email,
                    username: oauthData?.username || googleUser.email.split('@')[0],
                    firstName: googleUser.given_name,
                    lastName: googleUser.family_name,
                    avatar: googleUser.picture,
                    country: oauthData?.country || 'Nigeria',
                    role: 'creator',
                    isVerified: true,
                    isActive: true,
                    googleId: googleUser.id,
                    refreshTokens: [],
                    lastLogin: new Date(),
                    themePreferences: oauthData?.themePreferences || {
                        mode: 'system',
                        customTheme: {
                            primary: '#FFFFFF',
                            accent: '#D9D9D9',
                            radius: 0.75,
                        },
                    },
                });
                await user.save();
                logger_1.logger.info(`New Google user registered via callback: ${user.email}`);
            }
            else {
                user.lastLogin = new Date();
                if (!user.avatar) {
                    user.avatar = googleUser.picture;
                }
                if (!user.googleId) {
                    user.googleId = googleUser.id;
                }
                if (oauthData?.country) {
                    user.country = oauthData.country;
                    logger_1.logger.info(`Updated location for existing Google user ${user.email}: ${oauthData.country}`);
                }
                await user.save();
            }
            const accessToken = (0, auth_1.generateToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, auth_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            await user.addRefreshToken(refreshToken);
            return { accessToken, refreshToken };
        }
        catch (error) {
            logger_1.logger.error('Google OAuth callback error:', error);
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
            const user = await auth_model_1.User.findById(decoded.userId);
            if (!user || !user.refreshTokens.includes(refreshToken)) {
                throw new errorHandler_1.CustomError('Invalid refresh token', 401);
            }
            if (!user.isActive) {
                throw new errorHandler_1.CustomError('Account is deactivated', 401);
            }
            const newAccessToken = (0, auth_1.generateToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const newRefreshToken = (0, auth_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            await user.removeRefreshToken(refreshToken);
            await user.addRefreshToken(newRefreshToken);
            return {
                user: this.sanitizeUser(user),
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Refresh token error:', error);
            throw error;
        }
    }
    async logout(userId, refreshToken) {
        try {
            const user = await auth_model_1.User.findById(userId);
            if (user) {
                await user.removeRefreshToken(refreshToken);
                logger_1.logger.info(`User logged out: ${user.email}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            throw error;
        }
    }
    async logoutAll(userId) {
        try {
            const user = await auth_model_1.User.findById(userId);
            if (user) {
                await user.clearRefreshTokens();
                logger_1.logger.info(`User logged out from all devices: ${user.email}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Logout all error:', error);
            throw error;
        }
    }
    async forgotPassword(email) {
        try {
            const user = await auth_model_1.User.findOne({ email });
            if (!user) {
                logger_1.logger.info(`Password reset requested for non-existent email: ${email}`);
                return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
            }
            if (!user.password) {
                logger_1.logger.info(`Password reset requested for OAuth-only user: ${email} - allowing password creation`);
            }
            const resetToken = (0, passwordResetToken_1.generatePasswordResetToken)();
            const resetExpiration = (0, passwordResetToken_1.generatePasswordResetExpiration)();
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = resetExpiration;
            await user.save();
            try {
                await emailService_1.emailService.sendEmail({
                    to: user.email,
                    subject: user.password ? 'Reset Your KabaBeats Password' : 'Set Your KabaBeats Password',
                    html: emailService_1.emailService.generatePasswordResetEmailHTML(resetToken, user.username, user.email, user),
                    text: emailService_1.emailService.generatePasswordResetEmailText(resetToken, user.username, user.email, user),
                });
                logger_1.logger.info(`Password reset email sent to: ${email}`);
                return { success: true, message: 'Password reset email sent successfully.' };
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send password reset email:', emailError);
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save();
                throw new errorHandler_1.CustomError('Failed to send password reset email', 500);
            }
        }
        catch (error) {
            logger_1.logger.error('Forgot password error:', error);
            throw error;
        }
    }
    async resetPassword(token, password) {
        try {
            const user = await auth_model_1.User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() }
            }).select('+passwordResetToken +passwordResetExpires');
            if (!user) {
                throw new errorHandler_1.CustomError('Invalid or expired password reset token', 400);
            }
            if ((0, passwordResetToken_1.isPasswordResetTokenExpired)(user.passwordResetExpires)) {
                throw new errorHandler_1.CustomError('Password reset token has expired', 400);
            }
            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.clearRefreshTokens();
            await user.save();
            logger_1.logger.info(`Password reset successful for user: ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error('Reset password error:', error);
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await auth_model_1.User.findById(userId).select('+password');
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new errorHandler_1.CustomError('Current password is incorrect', 400);
            }
            user.password = newPassword;
            await user.save();
            await user.clearRefreshTokens();
            logger_1.logger.info(`Password changed for user: ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error('Change password error:', error);
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const user = await auth_model_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            return this.sanitizeUser(user);
        }
        catch (error) {
            logger_1.logger.error('Get profile error:', error);
            throw error;
        }
    }
    async updateProfile(userId, data) {
        try {
            const user = await auth_model_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (data.username && data.username !== user.username) {
                const existingUser = await auth_model_1.User.findOne({
                    username: data.username,
                    _id: { $ne: userId }
                });
                if (existingUser) {
                    throw new errorHandler_1.CustomError('Username already taken', 400);
                }
            }
            if (data.email && data.email !== user.email) {
                const existingUser = await auth_model_1.User.findOne({
                    email: data.email,
                    _id: { $ne: userId }
                });
                if (existingUser) {
                    throw new errorHandler_1.CustomError('Email already registered', 400);
                }
            }
            const allowedFields = ['username', 'email', 'firstName', 'lastName', 'bio', 'country', 'socialLinks'];
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    user[field] = data[field];
                }
            });
            await user.save();
            logger_1.logger.info(`Profile updated for user: ${user.email}`);
            return this.sanitizeUser(user);
        }
        catch (error) {
            logger_1.logger.error('Update profile error:', error);
            throw error;
        }
    }
    async deleteAccount(userId, password) {
        try {
            const user = await auth_model_1.User.findById(userId).select('+password');
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new errorHandler_1.CustomError('Password is incorrect', 400);
            }
            logger_1.logger.info(`Account deletion requested for user: ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error('Delete account error:', error);
            throw error;
        }
    }
    async updateThemePreferences(userId, themePreferences) {
        try {
            const user = await auth_model_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            user.themePreferences = themePreferences;
            await user.save();
            logger_1.logger.info(`Theme preferences updated for user: ${user.email}`);
            return this.sanitizeUser(user);
        }
        catch (error) {
            logger_1.logger.error('Update theme preferences error:', error);
            throw error;
        }
    }
    async getThemePreferences(userId) {
        try {
            const user = await auth_model_1.User.findById(userId).select('themePreferences');
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            return user.themePreferences || null;
        }
        catch (error) {
            logger_1.logger.error('Get theme preferences error:', error);
            throw error;
        }
    }
    async verifyEmailOTP(email, otp) {
        try {
            const user = await auth_model_1.User.findOne({ email }).select('+emailVerificationOTP +emailVerificationExpires');
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (user.isVerified) {
                throw new errorHandler_1.CustomError('Email already verified', 400);
            }
            if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
                throw new errorHandler_1.CustomError('No verification code found. Please request a new one.', 400);
            }
            if ((0, otpGenerator_1.isOTPExpired)(user.emailVerificationExpires)) {
                throw new errorHandler_1.CustomError('Verification code has expired. Please request a new one.', 400);
            }
            if (user.emailVerificationOTP !== otp) {
                throw new errorHandler_1.CustomError('Invalid verification code', 400);
            }
            user.isVerified = true;
            user.emailVerificationOTP = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            const accessToken = (0, auth_1.generateToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, auth_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            await user.addRefreshToken(refreshToken);
            user.lastLogin = new Date();
            await user.save();
            logger_1.logger.info(`Email verified for user: ${user.email}`);
            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Email verification error:', error);
            throw error;
        }
    }
    async resendVerificationOTP(email) {
        try {
            const user = await auth_model_1.User.findOne({ email });
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            if (user.isVerified) {
                throw new errorHandler_1.CustomError('Email already verified', 400);
            }
            const otp = (0, otpGenerator_1.generateOTP)();
            const otpExpiration = (0, otpGenerator_1.generateOTPExpiration)();
            user.emailVerificationOTP = otp;
            user.emailVerificationExpires = otpExpiration;
            await user.save();
            await emailService_1.emailService.sendEmail({
                to: user.email,
                subject: 'Verify Your KabaBeats Account',
                html: emailService_1.emailService.generateOTPEmailHTML(otp, user.username, user.email),
                text: emailService_1.emailService.generateOTPEmailText(otp, user.username, user.email),
            });
            logger_1.logger.info(`Verification email resent to ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error('Resend verification OTP error:', error);
            throw error;
        }
    }
    sanitizeUser(user) {
        const { password, refreshTokens, emailVerificationOTP, emailVerificationExpires, ...sanitizedUser } = user.toObject();
        return sanitizedUser;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map