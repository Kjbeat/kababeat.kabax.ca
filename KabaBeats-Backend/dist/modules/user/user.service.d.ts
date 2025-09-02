import { IUserProfile } from './user.model';
import { IUserService, UpdateProfileData, UserListResponse } from './user.interface';
export declare class UserService implements IUserService {
    getProfile(userId: string): Promise<IUserProfile>;
    updateProfile(userId: string, data: UpdateProfileData): Promise<IUserProfile>;
    followUser(userId: string, targetUserId: string): Promise<void>;
    unfollowUser(userId: string, targetUserId: string): Promise<void>;
    getFollowers(userId: string, page?: number, limit?: number): Promise<UserListResponse>;
    getFollowing(userId: string, page?: number, limit?: number): Promise<UserListResponse>;
    searchUsers(query: string, page?: number, limit?: number): Promise<UserListResponse>;
    getRecommendedUsers(userId: string, limit?: number): Promise<IUserProfile[]>;
    updateUserStats(userId: string, stats: Partial<IUserProfile['stats']>): Promise<void>;
    incrementPlays(userId: string, count?: number): Promise<void>;
    incrementLikes(userId: string, count?: number): Promise<void>;
    verifyUser(userId: string): Promise<void>;
    getTopProducers(limit?: number): Promise<IUserProfile[]>;
    getRecentUsers(limit?: number): Promise<IUserProfile[]>;
}
//# sourceMappingURL=user.service.d.ts.map