import { Request } from 'express';
import { IUserProfile } from './user.model';
import { JwtPayload } from '@/utils/auth';

// Request interfaces
export interface UserRequest extends Request {
  user?: JwtPayload;
}

// User service interfaces
export interface IUserService {
  getProfile(userId: string): Promise<IUserProfile>;
  updateProfile(userId: string, data: Partial<IUserProfile>): Promise<IUserProfile>;
  followUser(userId: string, targetUserId: string): Promise<void>;
  unfollowUser(userId: string, targetUserId: string): Promise<void>;
  getFollowers(userId: string, page?: number, limit?: number): Promise<{ users: IUserProfile[]; total: number; hasMore: boolean }>;
  getFollowing(userId: string, page?: number, limit?: number): Promise<{ users: IUserProfile[]; total: number; hasMore: boolean }>;
  searchUsers(query: string, page?: number, limit?: number): Promise<{ users: IUserProfile[]; total: number; hasMore: boolean }>;
  getRecommendedUsers(userId: string, limit?: number): Promise<IUserProfile[]>;
  updateUserStats(userId: string, stats: Partial<IUserProfile['stats']>): Promise<void>;
  incrementPlays(userId: string, count?: number): Promise<void>;
  incrementLikes(userId: string, count?: number): Promise<void>;
  verifyUser(userId: string): Promise<void>;
  getTopProducers(limit?: number): Promise<IUserProfile[]>;
  getRecentUsers(limit?: number): Promise<IUserProfile[]>;
}

// User controller interfaces
export interface IUserController {
  getProfile(req: UserRequest, res: any, next: any): Promise<void>;
  updateProfile(req: UserRequest, res: any, next: any): Promise<void>;
  followUser(req: UserRequest, res: any, next: any): Promise<void>;
  unfollowUser(req: UserRequest, res: any, next: any): Promise<void>;
  getFollowers(req: UserRequest, res: any, next: any): Promise<void>;
  getFollowing(req: UserRequest, res: any, next: any): Promise<void>;
  searchUsers(req: UserRequest, res: any, next: any): Promise<void>;
  getRecommendedUsers(req: UserRequest, res: any, next: any): Promise<void>;
  getTopProducers(req: UserRequest, res: any, next: any): Promise<void>;
  getRecentUsers(req: UserRequest, res: any, next: any): Promise<void>;
}

// Data transfer objects
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  avatar?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    privacy?: {
      showEmail?: boolean;
      showFollowers?: boolean;
      showFollowing?: boolean;
    };
  };
}

export interface FollowUserRequest {
  targetUserId: string;
}

export interface SearchUsersRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: IUserProfile[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UserStats {
  totalBeats: number;
  totalPlays: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  monthlyPlays: number;
  monthlyLikes: number;
  monthlyFollowers: number;
  topGenres: string[];
}

export interface UserRecommendation {
  user: IUserProfile;
  reason: string;
  score: number;
}

// Connection types
export interface ConnectionUser {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  isFollowing?: boolean;
  followsYou?: boolean;
  verified?: boolean;
  beats?: number;
  bio?: string;
  country?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
  };
}

export interface ConnectionListResponse {
  users: ConnectionUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
