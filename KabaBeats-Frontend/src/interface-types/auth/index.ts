export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'creator' | 'admin' | 'user';
  isVerified: boolean;
  country: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  themePreferences?: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, firstName?: string, lastName?: string, country?: string) => Promise<{ email: string; needsVerification: boolean }>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: (username: string, country?: string) => Promise<void>;
  handleOAuthCallback: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  updateThemePreferences: (themePreferences: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  }) => Promise<void>;
  getThemePreferences: () => Promise<{
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  } | null>;
  verifyEmailOTP: (email: string, otp: string) => Promise<void>;
  resendVerificationOTP: (email: string) => Promise<void>;
}
