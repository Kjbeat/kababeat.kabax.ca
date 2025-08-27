import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../core/types';

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const authMode = import.meta.env.VITE_AUTH || 'mock';

  useEffect(() => {
    // Initialize auth based on mode
    if (authMode === 'mock') {
      // Mock auth initialization
      setLoading(false);
    } else if (authMode === 'supabase') {
      // TODO: Initialize Supabase auth
      setLoading(false);
    }
  }, [authMode]);

  const signIn = async (email: string, password: string) => {
    if (authMode === 'mock') {
      // Mock sign in
      const mockUser: AuthUser = {
        id: 'mock-user-1',
        email,
        username: email.split('@')[0],
        isAuthenticated: true,
      };
      setUser(mockUser);
    } else if (authMode === 'supabase') {
      // TODO: Implement Supabase sign in
      throw new Error('Supabase auth not implemented yet');
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (authMode === 'mock') {
      // Mock sign up
      const mockUser: AuthUser = {
        id: 'mock-user-1',
        email,
        username,
        isAuthenticated: true,
      };
      setUser(mockUser);
    } else if (authMode === 'supabase') {
      // TODO: Implement Supabase sign up
      throw new Error('Supabase auth not implemented yet');
    }
  };

  const signOut = async () => {
    if (authMode === 'mock') {
      // Mock sign out
      setUser(null);
    } else if (authMode === 'supabase') {
      // TODO: Implement Supabase sign out
      throw new Error('Supabase auth not implemented yet');
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
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
