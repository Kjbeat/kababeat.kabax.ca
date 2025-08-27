import { AuthUser, User, UserProfile } from '@/core/types/user';

export interface UserService {
  // User operations
  getCurrentUser(): Promise<AuthUser | null>;
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile>;
  
  // Authentication
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string, username: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  
  // User data
  getUser(userId: string): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
}

