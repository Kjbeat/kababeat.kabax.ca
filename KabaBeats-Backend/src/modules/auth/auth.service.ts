import { User } from './auth.model';
import { IAuthService, LoginCredentials, RegisterData, AuthResponse, ChangePasswordRequest } from './auth.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { generateToken, generateRefreshToken, verifyRefreshToken, comparePassword } from '@/utils/auth';
import bcrypt from 'bcryptjs';
import { IUser } from '@/types';
import { emailService } from '@/utils/emailService';
import { generateOTP, generateOTPExpiration, isOTPExpired } from '@/utils/otpGenerator';
import { generatePasswordResetToken, generatePasswordResetExpiration, isPasswordResetTokenExpired } from '@/utils/passwordResetToken';
import { userLicenseSettingsService } from '@/modules/user/userLicenseSettings.service';

export class AuthService implements IAuthService {
  /**
   * Generate a unique username from email
   */
  private async generateUsernameFromEmail(email: string): Promise<string> {
    // Extract the part before @ and clean it up
    const emailParts = email.split('@');
    if (!emailParts[0]) {
      throw new Error('Invalid email format');
    }
    
    let baseUsername = emailParts[0]
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters except underscore
      .substring(0, 20); // Limit length
    
    // Ensure minimum length
    if (baseUsername.length < 3) {
      baseUsername = baseUsername + 'user';
    }
    
    // Check if username is available
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
      
      // Prevent infinite loop
      if (counter > 999) {
        username = `${baseUsername}${Date.now()}`;
        break;
      }
    }
    
    return username;
  }
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Received registration data:', {
        email: data.email,
        username: data.username,
        country: data.country,
        themePreferences: data.themePreferences
      });

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: data.email }, { username: data.username }]
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new CustomError('Email already registered', 400);
        }
        if (existingUser.username === data.username) {
          throw new CustomError('Username already taken', 400);
        }
      }

      // Generate OTP for email verification
      const otp = generateOTP();
      const otpExpiration = generateOTPExpiration();

      // Create new user
      const user = new User({
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

      // Create default license settings for the new user
      try {
        await userLicenseSettingsService.createDefaultUserLicenseSettings(user._id.toString());
        logger.info(`Default license settings created for user: ${user.email}`);
      } catch (licenseError) {
        logger.error('Failed to create default license settings:', licenseError);
        // Don't throw error here - user is created, license settings can be created later
      }

      // Send verification email
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: 'Verify Your KabaBeats Account',
          html: emailService.generateOTPEmailHTML(otp, user.username, user.email),
          text: emailService.generateOTPEmailText(otp, user.username, user.email),
        });
        logger.info(`Verification email sent to ${user.email}`);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't throw error here - user is created, they can request resend
      }

      // Generate tokens
      const accessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Add refresh token to user
      await user.addRefreshToken(refreshToken);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`New user registered: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user and include password for comparison
      const user = await User.findOne({ email: credentials.email }).select('+password');

      if (!user) {
        throw new CustomError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new CustomError('Account is deactivated', 401);
      }

      if (!user.isVerified) {
        // Generate new OTP for unverified user trying to login
        const otp = generateOTP();
        const otpExpiration = generateOTPExpiration();

        // Update user with new OTP
        user.emailVerificationOTP = otp;
        user.emailVerificationExpires = otpExpiration;
        await user.save();

        // Send verification email
        try {
          await emailService.sendEmail({
            to: user.email,
            subject: 'Verify Your KabaBeats Account',
            html: emailService.generateOTPEmailHTML(otp, user.username, user.email),
            text: emailService.generateOTPEmailText(otp, user.username, user.email),
          });
          logger.info(`Verification email sent to unverified user: ${user.email}`);
        } catch (emailError) {
          logger.error('Failed to send verification email to unverified user:', emailError);
          // Don't fail the login process if email fails - user can still use resend
        }

        throw new CustomError('Email not verified. Please check your email for verification code.', 401);
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
      }

      // Generate tokens
      const accessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Add refresh token to user
      await user.addRefreshToken(refreshToken);

      // Update last login and location
      user.lastLogin = new Date();
      if (credentials.country) {
        user.country = credentials.country;
        logger.info(`Updated location for user ${user.email}: ${credentials.country}`);
      }
      await user.save();

      logger.info(`User logged in: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async handleGoogleCallback(code: string, state?: string, oauthData?: { username?: string; country?: string; themePreferences?: any }): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        }),
      });

      if (!tokenResponse.ok) {
        throw new CustomError('Failed to exchange authorization code', 400);
      }

      const tokenData = await tokenResponse.json() as { access_token: string };
      const { access_token } = tokenData;

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new CustomError('Failed to get user info from Google', 400);
      }

      const googleUser = await userResponse.json() as {
        id: string;
        email: string;
        given_name: string;
        family_name: string;
        picture: string;
      };

      // Log OAuth data for debugging
      logger.info('Google OAuth callback received data:', {
        email: googleUser.email,
        oauthData: oauthData
      });

      // Check if user exists
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // Generate username from email (prioritize email-based username)
        const username = await this.generateUsernameFromEmail(googleUser.email);
        
        // Create new user
        user = new User({
          email: googleUser.email,
          username: username, // Always use email-based username
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          avatar: googleUser.picture,
          country: oauthData?.country || 'Nigeria', // Use provided country or default
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
        logger.info(`New Google user registered via callback: ${user.email} with username: ${user.username}`);

        // Create default license settings for the new Google user
        try {
          await userLicenseSettingsService.createDefaultUserLicenseSettings(user._id.toString());
          logger.info(`Default license settings created for Google user: ${user.email}`);
        } catch (licenseError) {
          logger.error('Failed to create default license settings for Google user:', licenseError);
          // Don't throw error here - user is created, license settings can be created later
        }
      } else {
        // Update existing user with Google info if needed
        user.lastLogin = new Date();
        if (!user.avatar) {
          user.avatar = googleUser.picture;
        }
        if (!user.googleId) {
          user.googleId = googleUser.id;
        }
        // Update location if provided
        if (oauthData?.country) {
          user.country = oauthData.country;
          logger.info(`Updated location for existing Google user ${user.email}: ${oauthData.country}`);
        }
        await user.save();
      }

      // Generate tokens
      const accessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Add refresh token to user
      await user.addRefreshToken(refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new CustomError('Invalid refresh token', 401);
      }

      if (!user.isActive) {
        throw new CustomError('Account is deactivated', 401);
      }

      // Generate new tokens
      const newAccessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Remove old refresh token and add new one
      await user.removeRefreshToken(refreshToken);
      await user.addRefreshToken(newRefreshToken);

      return {
        user: this.sanitizeUser(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (user) {
        await user.removeRefreshToken(refreshToken);
        logger.info(`User logged out: ${user.email}`);
      }
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (user) {
        await user.clearRefreshTokens();
        logger.info(`User logged out from all devices: ${user.email}`);
      }
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not for security
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      // Allow OAuth users to set a password (they don't have one yet)
      if (!user.password) {
        logger.info(`Password reset requested for OAuth-only user: ${email} - allowing password creation`);
      }

      // Generate password reset token
      const resetToken = generatePasswordResetToken();
      const resetExpiration = generatePasswordResetExpiration();

      // Save reset token to user
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpiration;
      await user.save();

      // Send password reset email
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: user.password ? 'Reset Your KabaBeats Password' : 'Set Your KabaBeats Password',
          html: emailService.generatePasswordResetEmailHTML(resetToken, user.username, user.email, user),
          text: emailService.generatePasswordResetEmailText(resetToken, user.username, user.email, user),
        });
        logger.info(`Password reset email sent to: ${email}`);
        return { success: true, message: 'Password reset email sent successfully.' };
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        // Clear the reset token if email fails
        user.passwordResetToken = undefined as any;
        user.passwordResetExpires = undefined as any;
        await user.save();
        throw new CustomError('Failed to send password reset email', 500);
      }
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      // Find user by reset token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      }).select('+passwordResetToken +passwordResetExpires');

      if (!user) {
        throw new CustomError('Invalid or expired password reset token', 400);
      }

      // Check if token is expired
      if (isPasswordResetTokenExpired(user.passwordResetExpires!)) {
        throw new CustomError('Password reset token has expired', 400);
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined as any;
      user.passwordResetExpires = undefined as any;
      
      // Clear all refresh tokens to force re-login
      await user.clearRefreshTokens();
      await user.save();

      logger.info(`Password reset successful for user: ${user.email}`);
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Clear all refresh tokens to force re-login
      await user.clearRefreshTokens();

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<Omit<IUser, 'password' | 'refreshTokens'>> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: Partial<IUser>): Promise<Omit<IUser, 'password' | 'refreshTokens'>> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Check for username conflicts if username is being updated
      if (data.username && data.username !== user.username) {
        const existingUser = await User.findOne({ 
          username: data.username,
          _id: { $ne: userId } // Exclude current user
        });
        if (existingUser) {
          throw new CustomError('Username already taken', 400);
        }
      }

      // Check for email conflicts if email is being updated
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({ 
          email: data.email,
          _id: { $ne: userId } // Exclude current user
        });
        if (existingUser) {
          throw new CustomError('Email already registered', 400);
        }
      }

      // Update allowed fields
      const allowedFields = ['username', 'email', 'firstName', 'lastName', 'bio', 'country', 'socialLinks'];
      allowedFields.forEach(field => {
        if (data[field as keyof IUser] !== undefined) {
          (user as any)[field] = data[field as keyof IUser];
        }
      });

      await user.save();
      logger.info(`Profile updated for user: ${user.email}`);

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new CustomError('Password is incorrect', 400);
      }

      // TODO: Implement account deletion logic
      // This should also handle related data cleanup
      logger.info(`Account deletion requested for user: ${user.email}`);
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }

  async updateThemePreferences(userId: string, themePreferences: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  }): Promise<Omit<IUser, 'password' | 'refreshTokens'>> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      user.themePreferences = themePreferences;
      await user.save();

      logger.info(`Theme preferences updated for user: ${user.email}`);
      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Update theme preferences error:', error);
      throw error;
    }
  }

  async getThemePreferences(userId: string): Promise<{
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  } | null> {
    try {
      const user = await User.findById(userId).select('themePreferences');
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      return user.themePreferences || null;
    } catch (error) {
      logger.error('Get theme preferences error:', error);
      throw error;
    }
  }

  async verifyEmailOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationExpires');
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.isVerified) {
        throw new CustomError('Email already verified', 400);
      }

      if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
        throw new CustomError('No verification code found. Please request a new one.', 400);
      }

      if (isOTPExpired(user.emailVerificationExpires)) {
        throw new CustomError('Verification code has expired. Please request a new one.', 400);
      }

      if (user.emailVerificationOTP !== otp) {
        throw new CustomError('Invalid verification code', 400);
      }

      // Verify the user
      user.isVerified = true;
      user.emailVerificationOTP = undefined as any;
      user.emailVerificationExpires = undefined as any;
      await user.save();

      // Generate tokens
      const accessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Add refresh token to user
      await user.addRefreshToken(refreshToken);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationOTP(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.isVerified) {
        throw new CustomError('Email already verified', 400);
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiration = generateOTPExpiration();

      // Update user with new OTP
      user.emailVerificationOTP = otp;
      user.emailVerificationExpires = otpExpiration;
      await user.save();

      // Send verification email
      await emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your KabaBeats Account',
        html: emailService.generateOTPEmailHTML(otp, user.username, user.email),
        text: emailService.generateOTPEmailText(otp, user.username, user.email),
      });

      logger.info(`Verification email resent to ${user.email}`);
    } catch (error) {
      logger.error('Resend verification OTP error:', error);
      throw error;
    }
  }



  private sanitizeUser(user: IUser): Omit<IUser, 'password' | 'refreshTokens'> {
    const { password, refreshTokens, emailVerificationOTP, emailVerificationExpires, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }
}
