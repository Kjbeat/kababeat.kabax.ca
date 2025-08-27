import { UserService } from '../../core/services/UserService';
import { User, UserProfile, AuthUser } from '../../core/types';

export class UserServiceSupabase implements UserService {
  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Implement with Supabase
    // 1. Get current user from Supabase auth
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    // TODO: Implement with Supabase
    // 1. Select from user_profiles table with RLS
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    // TODO: Implement with Supabase
    // 1. Update user_profiles table with RLS
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    // TODO: Implement with Supabase
    // 1. Use Supabase auth signIn
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async signUp(email: string, password: string, username: string): Promise<AuthUser> {
    // TODO: Implement with Supabase
    // 1. Use Supabase auth signUp
    // 2. Create user profile
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async signOut(): Promise<void> {
    // TODO: Implement with Supabase
    // 1. Use Supabase auth signOut
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async getUser(userId: string): Promise<User> {
    // TODO: Implement with Supabase
    // 1. Select from users table with RLS
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }

  async searchUsers(query: string): Promise<User[]> {
    // TODO: Implement with Supabase
    // 1. Search users table
    throw new Error('Not implemented - TODO: Implement with Supabase');
  }
}
