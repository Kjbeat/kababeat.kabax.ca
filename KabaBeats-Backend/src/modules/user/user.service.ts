import { UserProfile, IUserProfile } from './user.model';
import { IUserService, UpdateProfileData, UserListResponse, UserRecommendation } from './user.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';

export class UserService implements IUserService {
  async getProfile(userId: string): Promise<IUserProfile> {
    try {
      const user = await UserProfile.findById(userId)
        .populate('followers', 'username firstName lastName avatar isVerified')
        .populate('following', 'username firstName lastName avatar isVerified');

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      return user;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<IUserProfile> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Update allowed fields
      const allowedFields = [
        'firstName', 'lastName', 'bio', 'country', 'avatar', 
        'socialLinks', 'preferences'
      ];

      allowedFields.forEach(field => {
        if (data[field as keyof UpdateProfileData] !== undefined) {
          (user as any)[field] = data[field as keyof UpdateProfileData];
        }
      });

      await user.save();
      logger.info(`Profile updated for user: ${user.email}`);

      return user;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async followUser(userId: string, targetUserId: string): Promise<void> {
    try {
      if (userId === targetUserId) {
        throw new CustomError('Cannot follow yourself', 400);
      }

      const [user, targetUser] = await Promise.all([
        UserProfile.findById(userId),
        UserProfile.findById(targetUserId)
      ]);

      if (!user || !targetUser) {
        throw new CustomError('User not found', 404);
      }

      // Check if already following
      if (user.following.includes(targetUserId)) {
        throw new CustomError('Already following this user', 400);
      }

      // Add to following list
      await (user as any).follow(targetUserId);
      
      // Add to target user's followers
      await (targetUser as any).addFollower(userId);

      logger.info(`User ${userId} followed ${targetUserId}`);
    } catch (error) {
      logger.error('Follow user error:', error);
      throw error;
    }
  }

  async unfollowUser(userId: string, targetUserId: string): Promise<void> {
    try {
      if (userId === targetUserId) {
        throw new CustomError('Cannot unfollow yourself', 400);
      }

      const [user, targetUser] = await Promise.all([
        UserProfile.findById(userId),
        UserProfile.findById(targetUserId)
      ]);

      if (!user || !targetUser) {
        throw new CustomError('User not found', 404);
      }

      // Remove from following list
      await (user as any).unfollow(targetUserId);
      
      // Remove from target user's followers
      await (targetUser as any).removeFollower(userId);

      logger.info(`User ${userId} unfollowed ${targetUserId}`);
    } catch (error) {
      logger.error('Unfollow user error:', error);
      throw error;
    }
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<UserListResponse> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const skip = (page - 1) * limit;
      const total = user.followers.length;

      const followers = await UserProfile.find({
        _id: { $in: user.followers }
      })
        .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
        .skip(skip)
        .limit(limit)
        .sort({ totalFollowers: -1 });

      return {
        users: followers,
        total,
        page,
        limit,
        hasMore: skip + followers.length < total
      };
    } catch (error) {
      logger.error('Get followers error:', error);
      throw error;
    }
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<UserListResponse> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const skip = (page - 1) * limit;
      const total = user.following.length;

      const following = await UserProfile.find({
        _id: { $in: user.following }
      })
        .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
        .skip(skip)
        .limit(limit)
        .sort({ totalFollowers: -1 });

      return {
        users: following,
        total,
        page,
        limit,
        hasMore: skip + following.length < total
      };
    } catch (error) {
      logger.error('Get following error:', error);
      throw error;
    }
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<UserListResponse> {
    try {
      const skip = (page - 1) * limit;
      
      const searchRegex = new RegExp(query, 'i');
      const searchQuery = {
        $or: [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { bio: searchRegex }
        ],
        isActive: true
      };

      const [users, total] = await Promise.all([
        UserProfile.find(searchQuery)
          .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
          .skip(skip)
          .limit(limit)
          .sort({ totalFollowers: -1, totalBeats: -1 }),
        UserProfile.countDocuments(searchQuery)
      ]);

      return {
        users,
        total,
        page,
        limit,
        hasMore: skip + users.length < total
      };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  async getRecommendedUsers(userId: string, limit: number = 10): Promise<IUserProfile[]> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Get users with similar interests (same country, similar genres)
      const recommendations = await UserProfile.find({
        _id: { 
          $nin: [userId, ...user.following] // Exclude self and already following
        },
        isActive: true,
        $or: [
          { country: user.country },
          { 'stats.topGenres': { $in: user.stats.topGenres } }
        ]
      })
        .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers stats')
        .limit(limit)
        .sort({ totalFollowers: -1, totalBeats: -1 });

      return recommendations;
    } catch (error) {
      logger.error('Get recommended users error:', error);
      throw error;
    }
  }

  async updateUserStats(userId: string, stats: Partial<IUserProfile['stats']>): Promise<void> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      await (user as any).updateStats(stats);
      logger.info(`Stats updated for user: ${userId}`);
    } catch (error) {
      logger.error('Update user stats error:', error);
      throw error;
    }
  }

  async incrementPlays(userId: string, count: number = 1): Promise<void> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      await (user as any).incrementPlays(count);
    } catch (error) {
      logger.error('Increment plays error:', error);
      throw error;
    }
  }

  async incrementLikes(userId: string, count: number = 1): Promise<void> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      await (user as any).incrementLikes(count);
    } catch (error) {
      logger.error('Increment likes error:', error);
      throw error;
    }
  }

  async verifyUser(userId: string): Promise<void> {
    try {
      const user = await UserProfile.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      user.isVerified = true;
      await user.save();
      
      logger.info(`User verified: ${userId}`);
    } catch (error) {
      logger.error('Verify user error:', error);
      throw error;
    }
  }

  async getTopProducers(limit: number = 20): Promise<IUserProfile[]> {
    try {
      const producers = await UserProfile.find({
        isProducer: true,
        isActive: true
      })
        .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers totalPlays')
        .sort({ totalPlays: -1, totalFollowers: -1 })
        .limit(limit);

      return producers;
    } catch (error) {
      logger.error('Get top producers error:', error);
      throw error;
    }
  }

  async getRecentUsers(limit: number = 20): Promise<IUserProfile[]> {
    try {
      const users = await UserProfile.find({
        isActive: true
      })
        .select('username firstName lastName avatar bio isVerified totalBeats totalFollowers')
        .sort({ createdAt: -1 })
        .limit(limit);

      return users;
    } catch (error) {
      logger.error('Get recent users error:', error);
      throw error;
    }
  }
}
