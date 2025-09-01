import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  country: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, firstName?: string, lastName?: string, country?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: (username: string, country?: string) => Promise<void>;
  handleOAuthCallback: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved tokens and user in localStorage
    const savedAccessToken = localStorage.getItem('kababeats-access-token');
    const savedRefreshToken = localStorage.getItem('kababeats-refresh-token');
    const savedUser = localStorage.getItem('kababeats-user');
    
    if (savedAccessToken && savedRefreshToken && savedUser) {
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { user: userData, accessToken, refreshToken: refreshTokenData } = data.data;

      setUser(userData);
      setAccessToken(accessToken);
      setRefreshToken(refreshTokenData);
      
      localStorage.setItem('kababeats-user', JSON.stringify(userData));
      localStorage.setItem('kababeats-access-token', accessToken);
      localStorage.setItem('kababeats-refresh-token', refreshTokenData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string, firstName?: string, lastName?: string, country?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          username, 
          firstName, 
          lastName, 
          country: country || 'Nigeria' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { user: userData, accessToken, refreshToken: refreshTokenData } = data.data;

      setUser(userData);
      setAccessToken(accessToken);
      setRefreshToken(refreshTokenData);
      
      localStorage.setItem('kababeats-user', JSON.stringify(userData));
      localStorage.setItem('kababeats-access-token', accessToken);
      localStorage.setItem('kababeats-refresh-token', refreshTokenData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback';
      const scope = 'email profile';
      const state = Math.random().toString(36).substring(7);
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `state=${state}`;
      
      // Store state for verification
      localStorage.setItem('oauth-state', state);
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google OAuth error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signupWithGoogle = async (username: string, country: string = 'Nigeria') => {
    // For Google OAuth, signup and login are the same flow
    await loginWithGoogle();
  };

  const handleOAuthCallback = useCallback(async (token: string, refreshTokenData: string) => {
    try {
      // Store tokens
      setAccessToken(token);
      setRefreshToken(refreshTokenData);
      localStorage.setItem('kababeats-access-token', token);
      localStorage.setItem('kababeats-refresh-token', refreshTokenData);

      // Fetch user profile
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      const userData = data.data;

      setUser(userData);
      localStorage.setItem('kababeats-user', JSON.stringify(userData));
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }, []);

  const logout = async () => {
    try {
      if (refreshToken) {
        // Call logout endpoint to invalidate refresh token
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('kababeats-user');
      localStorage.removeItem('kababeats-access-token');
      localStorage.removeItem('kababeats-refresh-token');
      localStorage.removeItem('oauth-state');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      loginWithGoogle,
      signupWithGoogle,
      handleOAuthCallback,
      logout,
      loading,
      accessToken,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}