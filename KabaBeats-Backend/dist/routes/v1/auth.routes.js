"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/modules/auth");
const auth_2 = require("@/utils/auth");
const validation_1 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const authController = new auth_1.AuthController();
const registerSchema = joi_1.default.object({
    email: validation_1.commonSchemas.email,
    username: validation_1.commonSchemas.username,
    password: validation_1.commonSchemas.password,
    firstName: joi_1.default.string().max(50).optional(),
    lastName: joi_1.default.string().max(50).optional(),
    country: joi_1.default.string().max(50).optional(),
    themePreferences: joi_1.default.object({
        mode: joi_1.default.string().valid('light', 'dark', 'system').optional(),
        customTheme: joi_1.default.object({
            primary: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
            accent: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
            radius: joi_1.default.number().min(0.125).max(2).optional(),
        }).optional(),
    }).optional(),
});
const loginSchema = joi_1.default.object({
    email: validation_1.commonSchemas.email,
    password: joi_1.default.string().required(),
    country: joi_1.default.string().max(50).optional(),
});
const refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required(),
});
const forgotPasswordSchema = joi_1.default.object({
    email: validation_1.commonSchemas.email,
});
const resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    password: validation_1.commonSchemas.password,
});
const changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: validation_1.commonSchemas.password,
});
const updateProfileSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).optional(),
    email: joi_1.default.string().email().optional(),
    firstName: joi_1.default.string().max(50).optional(),
    lastName: joi_1.default.string().max(50).optional(),
    bio: joi_1.default.string().max(500).allow('').optional(),
    country: joi_1.default.string().max(50).optional(),
    socialLinks: joi_1.default.object({
        website: joi_1.default.string().uri().allow('').optional(),
        instagram: joi_1.default.string().uri().allow('').optional(),
        twitter: joi_1.default.string().uri().allow('').optional(),
        youtube: joi_1.default.string().uri().allow('').optional(),
    }).optional(),
});
const deleteAccountSchema = joi_1.default.object({
    password: joi_1.default.string().required(),
});
const themePreferencesSchema = joi_1.default.object({
    themePreferences: joi_1.default.object({
        mode: joi_1.default.string().valid('light', 'dark', 'system').required(),
        customTheme: joi_1.default.object({
            primary: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
            accent: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
            radius: joi_1.default.number().min(0.125).max(2).optional(),
        }).optional(),
    }).required(),
});
const verifyOTPSchema = joi_1.default.object({
    email: validation_1.commonSchemas.email,
    otp: joi_1.default.string().length(7).pattern(/^[0-9]{7}$/).required(),
});
const resendOTPSchema = joi_1.default.object({
    email: validation_1.commonSchemas.email,
});
router.post('/register', (0, validation_1.validate)(registerSchema), authController.register);
router.post('/login', (0, validation_1.validate)(loginSchema), authController.login);
router.get('/google/callback', authController.googleCallback);
router.post('/refresh-token', (0, validation_1.validate)(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', (0, validation_1.validate)(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', (0, validation_1.validate)(resetPasswordSchema), authController.resetPassword);
router.post('/verify-otp', (0, validation_1.validate)(verifyOTPSchema), authController.verifyEmailOTP);
router.post('/resend-otp', (0, validation_1.validate)(resendOTPSchema), authController.resendVerificationOTP);
router.use(auth_2.authenticate);
router.post('/logout', (0, validation_1.validate)(refreshTokenSchema), authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', (0, validation_1.validate)(changePasswordSchema), authController.changePassword);
router.get('/profile', authController.getProfile);
router.put('/profile', (0, validation_1.validate)(updateProfileSchema), authController.updateProfile);
router.delete('/account', (0, validation_1.validate)(deleteAccountSchema), authController.deleteAccount);
router.put('/theme-preferences', (0, validation_1.validate)(themePreferencesSchema), authController.updateThemePreferences);
router.get('/theme-preferences', authController.getThemePreferences);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map