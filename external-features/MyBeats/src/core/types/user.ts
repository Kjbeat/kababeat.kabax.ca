export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isAuthenticated: boolean;
}

