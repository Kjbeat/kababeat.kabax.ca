import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hslToHex, hexToHslVar } from '../utils/hslToHex';
import { getUserCountry } from '../utils/geolocation';
import { User, AuthContextType } from '../interface-types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Helper function to convert HSL to hex


// Helper function to convert hex to HSL for CSS variables


// Helper function to load user's theme preferences
const loadUserThemePreferences = (themePreferences: {
  mode: 'light' | 'dark' | 'system';
  customTheme?: {
    primary: string;
    accent: string;
    radius: number;
  };
}) => {
  // Set theme mode
  localStorage.setItem('kababeats-theme-mode', themePreferences.mode);
  
  // Apply custom theme if available
  if (themePreferences.customTheme) {
    const { primary, accent, radius } = themePreferences.customTheme;
    
    // Convert hex to HSL for CSS variables
    const primaryHsl = hexToHslVar(primary);
    const accentHsl = hexToHslVar(accent);
    
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--radius', `${radius}rem`);
    
    // Save to localStorage for persistence
    const customThemeVars = {
      '--primary': primaryHsl,
      '--accent': accentHsl,
      '--radius': `${radius}rem`
    };
    localStorage.setItem('custom-theme-vars-v1', JSON.stringify(customThemeVars));
  }
};

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
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Load user's theme preferences
      if (userData.themePreferences) {
        loadUserThemePreferences(userData.themePreferences);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Detect user's current location
      let detectedCountry = 'Nigeria'; // Default fallback
      try {
        console.log('AuthContext: Detecting location for login...');
        detectedCountry = await getUserCountry();
        console.log('AuthContext: Detected country for login:', detectedCountry);
      } catch (error) {
        console.error('AuthContext: Failed to detect location during login:', error);
        // Continue with default country
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, country: detectedCountry }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { user: userData, accessToken, refreshToken: refreshTokenData } = data.data;

      setUser(userData);
      setAccessToken(accessToken);
      setRefreshToken(refreshTokenData);
      
      localStorage.setItem('kababeats-user', JSON.stringify(userData));
      localStorage.setItem('kababeats-access-token', accessToken);
      localStorage.setItem('kababeats-refresh-token', refreshTokenData);
      
      // Load user's theme preferences
      if (userData.themePreferences) {
        loadUserThemePreferences(userData.themePreferences);
      }
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
      // Get current theme mode from localStorage
      const currentTheme = localStorage.getItem('kababeats-theme-mode') || 'system';
      const customTheme = localStorage.getItem('custom-theme-vars-v1');
      
      // Determine effective theme mode (handle 'system' by checking system preference)
      let effectiveTheme: 'light' | 'dark' = 'dark';
      if (currentTheme === 'light') {
        effectiveTheme = 'light';
      } else if (currentTheme === 'dark') {
        effectiveTheme = 'dark';
      } else if (currentTheme === 'system') {
        // Check system preference
        effectiveTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      
      // Use default platform theme colors based on effective theme mode
      const themePreferences: {
        mode: 'light' | 'dark' | 'system';
        customTheme?: {
          primary: string;
          accent: string;
          radius: number;
        };
      } = {
        mode: currentTheme as 'light' | 'dark' | 'system',
        customTheme: {
          primary: effectiveTheme === 'dark' ? '#FFFFFF' : '#000000', // White for dark mode, black for light mode
          accent: effectiveTheme === 'dark' ? '#D9D9D9' : '#262626',  // Light gray for dark mode, dark gray for light mode
          radius: 0.75,       // Default radius
        },
      };

      // If user has custom theme, preserve their choices
      if (customTheme) {
        try {
          const parsedCustomTheme = JSON.parse(customTheme);
          
          // Convert HSL to hex if needed
          const convertToHex = (color: string): string => {
            if (color.startsWith('#')) return color;
            if (color.includes('hsl') || color.includes('%')) {
              // Convert HSL to hex
              const hslMatch = color.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
              if (hslMatch) {
                const h = parseInt(hslMatch[1]);
                const s = parseInt(hslMatch[2]);
                const l = parseInt(hslMatch[3]);
                return hslToHex(h, s, l);
              }
            }
            return '#000000'; // fallback
          };

          // Override defaults with existing custom theme
          themePreferences.customTheme = {
            primary: convertToHex(parsedCustomTheme['--primary'] || themePreferences.customTheme!.primary),
            accent: convertToHex(parsedCustomTheme['--accent'] || themePreferences.customTheme!.accent),
            radius: parseFloat(parsedCustomTheme['--radius']?.replace('rem', '')) || themePreferences.customTheme!.radius,
          };
        } catch (error) {
          console.error('Error parsing custom theme:', error);
          // Keep the default theme if parsing fails
        }
      }

      const signupData = { 
        email, 
        password, 
        username, 
        firstName, 
        lastName, 
        country: country || 'Nigeria',
        themePreferences
      };
      
      console.log('AuthContext: Sending signup data:', signupData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const { user: userData, accessToken, refreshToken: refreshTokenData } = data.data;

      // Store user data temporarily for OTP verification
      // Don't set as authenticated until email is verified
      localStorage.setItem('pending-verification-email', email);
      localStorage.setItem('pending-verification-user', JSON.stringify(userData));
      
      // Return the email for OTP verification
      return { email, needsVerification: true };
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
      const baseRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback';
      const scope = 'email profile';
      const state = Math.random().toString(36).substring(7);
      
      // Detect current location for login
      let detectedCountry = 'Nigeria'; // Default fallback
      try {
        console.log('AuthContext: Detecting location for Google login...');
        detectedCountry = await getUserCountry();
        console.log('AuthContext: Detected country for Google login:', detectedCountry);
      } catch (error) {
        console.error('AuthContext: Failed to detect location during Google login:', error);
        // Continue with default country
      }
      
      // Get OAuth data from localStorage
      const oauthUsername = localStorage.getItem('oauth-username');
      const oauthCountry = localStorage.getItem('oauth-country') || detectedCountry; // Use detected country if not in localStorage
      const oauthThemePreferences = localStorage.getItem('oauth-theme-preferences');
      
      console.log('AuthContext: OAuth data from localStorage:', {
        oauthUsername,
        oauthCountry,
        oauthThemePreferences
      });
      
      // Build redirect URI with OAuth data as query parameters
      const redirectParams = new URLSearchParams();
      if (oauthUsername) redirectParams.append('username', oauthUsername);
      if (oauthCountry) redirectParams.append('country', oauthCountry);
      if (oauthThemePreferences) redirectParams.append('themePreferences', oauthThemePreferences);
      
      const redirectUri = redirectParams.toString() 
        ? `${baseRedirectUri}?${redirectParams.toString()}`
        : baseRedirectUri;
      
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
    // Get current theme mode from localStorage
    const currentTheme = localStorage.getItem('kababeats-theme-mode') || 'system';
    const customTheme = localStorage.getItem('custom-theme-vars-v1');
    
    // Determine effective theme mode (handle 'system' by checking system preference)
    let effectiveTheme: 'light' | 'dark' = 'dark';
    if (currentTheme === 'light') {
      effectiveTheme = 'light';
    } else if (currentTheme === 'dark') {
      effectiveTheme = 'dark';
    } else if (currentTheme === 'system') {
      // Check system preference
      effectiveTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    
    // Use default platform theme colors based on effective theme mode
    const themePreferences: {
      mode: 'light' | 'dark' | 'system';
      customTheme?: {
        primary: string;
        accent: string;
        radius: number;
      };
    } = {
      mode: currentTheme as 'light' | 'dark' | 'system',
      customTheme: {
        primary: effectiveTheme === 'dark' ? '#FFFFFF' : '#000000', // White for dark mode, black for light mode
        accent: effectiveTheme === 'dark' ? '#D9D9D9' : '#262626',  // Light gray for dark mode, dark gray for light mode
        radius: 0.75,       // Default radius
      },
    };

    // If user has custom theme, preserve their choices
    if (customTheme) {
      try {
        const parsedCustomTheme = JSON.parse(customTheme);
        
        // Convert HSL to hex if needed
        const convertToHex = (color: string): string => {
          if (color.startsWith('#')) return color;
          if (color.includes('hsl') || color.includes('%')) {
            // Convert HSL to hex
            const hslMatch = color.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
            if (hslMatch) {
              const h = parseInt(hslMatch[1]);
              const s = parseInt(hslMatch[2]);
              const l = parseInt(hslMatch[3]);
              return hslToHex(h, s, l);
            }
          }
          return '#000000'; // fallback
        };

        // Override defaults with existing custom theme
        themePreferences.customTheme = {
          primary: convertToHex(parsedCustomTheme['--primary'] || themePreferences.customTheme!.primary),
          accent: convertToHex(parsedCustomTheme['--accent'] || themePreferences.customTheme!.accent),
          radius: parseFloat(parsedCustomTheme['--radius']?.replace('rem', '')) || themePreferences.customTheme!.radius,
        };
      } catch (error) {
        console.error('Error parsing custom theme:', error);
        // Keep the default theme if parsing fails
      }
    }

    // Store theme preferences for OAuth callback
    localStorage.setItem('oauth-theme-preferences', JSON.stringify(themePreferences));
    localStorage.setItem('oauth-username', username);
    localStorage.setItem('oauth-country', country);
    
    console.log('AuthContext: Stored OAuth data in localStorage:', {
      username,
      country,
      themePreferences
    });
    
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
      
      // Load user's theme preferences
      if (userData.themePreferences) {
        loadUserThemePreferences(userData.themePreferences);
      }
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

  const updateThemePreferences = async (themePreferences: {
    mode: 'light' | 'dark' | 'system';
    customTheme?: {
      primary: string;
      accent: string;
      radius: number;
    };
  }) => {
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/theme-preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ themePreferences }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update theme preferences');
      }

      const data = await response.json();
      const updatedUser = data.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('kababeats-user', JSON.stringify(updatedUser));
      
      // Apply the updated theme preferences immediately
      loadUserThemePreferences(themePreferences);
    } catch (error) {
      console.error('Update theme preferences error:', error);
      throw error;
    }
  };

  const getThemePreferences = async () => {
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/theme-preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get theme preferences');
      }

      const data = await response.json();
      return data.data.themePreferences;
    } catch (error) {
      console.error('Get theme preferences error:', error);
      throw error;
    }
  };

  const verifyEmailOTP = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await response.json();
      const { user: userData, accessToken, refreshToken: refreshTokenData } = data.data;

      setUser(userData);
      setAccessToken(accessToken);
      setRefreshToken(refreshTokenData);
      
      localStorage.setItem('kababeats-user', JSON.stringify(userData));
      localStorage.setItem('kababeats-access-token', accessToken);
      localStorage.setItem('kababeats-refresh-token', refreshTokenData);
      
      // Clear pending verification data
      localStorage.removeItem('pending-verification-email');
      localStorage.removeItem('pending-verification-user');
      
      // Load user's theme preferences
      if (userData.themePreferences) {
        loadUserThemePreferences(userData.themePreferences);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationOTP = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
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
      updateThemePreferences,
      getThemePreferences,
      verifyEmailOTP,
      resendVerificationOTP,
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