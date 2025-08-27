import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  isProducer: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, country: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: (username: string, country?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('kababeats-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any email/password combination
    const loginUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0], // Use part before @ as name
      country: 'Nigeria', // Default country
      isProducer: false, // Default to artist
    };
    
    setUser(loginUser);
    localStorage.setItem('kababeats-user', JSON.stringify(loginUser));
    setLoading(false);
  };

  const signup = async (email: string, password: string, username: string, country: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: username,
      country,
      isProducer: false, // Default to artist for now
    };
    
    setUser(newUser);
    localStorage.setItem('kababeats-user', JSON.stringify(newUser));
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate Google user data
    const googleUser: User = {
      id: 'google_' + Date.now().toString(),
      email: 'user@gmail.com',
      name: 'Google User',
      country: 'Nigeria', // Default country
      isProducer: false, // Default to artist
    };
    
    setUser(googleUser);
    localStorage.setItem('kababeats-user', JSON.stringify(googleUser));
    setLoading(false);
  };

  const signupWithGoogle = async (username: string, country: string = 'Nigeria') => {
    setLoading(true);
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate Google user data
    const googleUser: User = {
      id: 'google_' + Date.now().toString(),
      email: 'user@gmail.com', // This would come from Google OAuth
      name: username,
      country,
      isProducer: false, // Default to artist
    };
    
    setUser(googleUser);
    localStorage.setItem('kababeats-user', JSON.stringify(googleUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kababeats-user');
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