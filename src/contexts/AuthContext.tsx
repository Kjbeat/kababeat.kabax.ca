import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  is_verified: boolean;
  is_creator: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, country: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: (username: string, country?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Supabase user profile to our User interface
  const convertUserProfile = (profile: UserProfile): User => ({
    id: profile.user_id,
    email: profile.email,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    country: profile.country,
    is_verified: profile.is_verified,
    is_creator: profile.is_creator,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  });

  // Get user profile from database
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('kababeat_user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Get email from auth.users table separately
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser?.user?.email || '';

      return convertUserProfile({
        ...data,
        email,
      });
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state - only check session, don't auto-restore
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only check if there's an active session, don't auto-restore
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        // Only set user if session exists and is valid
        if (session?.user && session.user.email) {
          const userProfile = await getUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.warn('User profile not found during initialization, but keeping session');
            // Don't sign out - let them stay logged in but they might need to complete profile
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.email?.split('@')[0] || 'user',
              display_name: session.user.email?.split('@')[0] || 'user',
              avatar_url: null,
              bio: null,
              country: 'Nigeria',
              is_verified: false,
              is_creator: false,
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
                  if (event === 'SIGNED_IN' && session?.user) {
            const userProfile = await getUserProfile(session.user.id);
            if (userProfile) {
              setUser(userProfile);
            } else {
              console.warn('Could not load user profile after sign in');
              // Don't set user to null here - let the user stay signed in
              // but they might need to complete their profile
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const userProfile = await getUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
        } else {
          console.warn('User profile not found, but allowing login');
          // Create a basic user object from auth data
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            username: data.user.email?.split('@')[0] || 'user',
            display_name: data.user.email?.split('@')[0] || 'user',
            avatar_url: null,
            bio: null,
            country: 'Nigeria',
            is_verified: false,
            is_creator: false,
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string, country: string) => {
    setLoading(true);
    try {
      // Check if username is available
      const { data: existingUser } = await supabase
        .from('kababeat_user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Create user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
            country,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userProfile = await getUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
        } else {
          throw new Error('Failed to create user profile');
        }
      }
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = async (username: string, country: string = 'Nigeria') => {
    setLoading(true);
    try {
      // Check if username is available
      const { data: existingUser } = await supabase
        .from('kababeat_user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already exists');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Store username and country for after OAuth redirect
      sessionStorage.setItem('pending-username', username);
      sessionStorage.setItem('pending-country', country);
    } catch (error) {
      console.error('Google signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('kababeat_update_user_profile', {
          p_display_name: updates.display_name,
          p_bio: updates.bio,
          p_avatar_url: updates.avatar_url,
          p_country: updates.country,
        });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const updatedProfile = data[0];
        setUser(convertUserProfile({
          ...updatedProfile,
          email: user.email,
        }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
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
      logout,
      loading,
      updateProfile,
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