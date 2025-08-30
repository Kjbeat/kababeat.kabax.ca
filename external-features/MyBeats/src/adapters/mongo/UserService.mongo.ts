import { UserService } from '../../core/services/UserService';
import { User, UserProfile, AuthUser } from '@/core/types/user';

export class UserServiceMongo implements UserService {
  async getCurrentUser(): Promise<AuthUser | null> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async signUp(email: string, password: string, username: string): Promise<AuthUser> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async signOut(): Promise<void> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getUser(userId: string): Promise<User> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async searchUsers(query: string): Promise<User[]> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }
}
