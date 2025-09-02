import { User } from './auth.model';
import { IAuthService, LoginCredentials, RegisterData, GoogleAuthData, AuthResponse, ChangePasswordRequest } from './auth.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { generateToken, generateRefreshToken, verifyRefreshToken, comparePassword } from '@/utils/auth';
import { IUser } from '@/types';

export class AuthService implements IAuthService {
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

      // Create new user
      const user = new User({
        ...data,
        role: 'user',
        isVerified: false,
        isActive: true,
        refreshTokens: [],
      });

      console.log('AuthService: Creating user with data:', {
        email: user.email,
        username: user.username,
        country: user.country,
        themePreferences: user.themePreferences
      });

      await user.save();
      
      console.log('AuthService: User created successfully with ID:', user._id);

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

      // Update last login
      user.lastLogin = new Date();
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

  async loginWithGoogle(data: GoogleAuthData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: data.email });

      if (user) {
        // User exists, update last login
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: data.avatar,
          country: data.country || 'Nigeria',
          role: 'creator',
          isVerified: true, // Google accounts are pre-verified
          isActive: true,
          refreshTokens: [],
          lastLogin: new Date(),
        });

        await user.save();
        logger.info(`New Google user registered: ${user.email}`);
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

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Google login error:', error);
      throw error;
    }
  }

  async handleGoogleCallback(code: string, state?: string): Promise<{ accessToken: string; refreshToken: string }> {
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

      // Check if user exists
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // Create new user
        user = new User({
          email: googleUser.email,
          username: googleUser.email.split('@')[0], // Use email prefix as username
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          avatar: googleUser.picture,
          country: 'Nigeria',
          role: 'creator',
          isVerified: true,
          isActive: true,
          googleId: googleUser.id,
          refreshTokens: [],
          lastLogin: new Date(),
        });

        await user.save();
        logger.info(`New Google user registered via callback: ${user.email}`);
      } else {
        // Update existing user with Google info if needed
        user.lastLogin = new Date();
        if (!user.avatar) {
          user.avatar = googleUser.picture;
        }
        if (!user.googleId) {
          user.googleId = googleUser.id;
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

  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return;
      }

      // TODO: Implement email sending logic
      // For now, just log the request
      logger.info(`Password reset requested for: ${email}`);
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      // TODO: Implement token verification and password reset
      logger.info(`Password reset attempted with token: ${token}`);
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

  async verifyEmail(token: string): Promise<void> {
    try {
      // TODO: Implement email verification logic
      logger.info(`Email verification attempted with token: ${token}`);
    } catch (error) {
      logger.error('Verify email error:', error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.isVerified) {
        throw new CustomError('Email already verified', 400);
      }

      // TODO: Implement email sending logic
      logger.info(`Verification email resent to: ${email}`);
    } catch (error) {
      logger.error('Resend verification email error:', error);
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

      // Update allowed fields
      const allowedFields = ['firstName', 'lastName', 'bio', 'country', 'socialLinks'];
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

  private sanitizeUser(user: IUser): Omit<IUser, 'password' | 'refreshTokens'> {
    const { password, refreshTokens, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }
}
