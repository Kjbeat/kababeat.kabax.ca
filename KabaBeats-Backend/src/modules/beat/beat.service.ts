import { Beat } from './beat.model';
import { IBeatService, CreateBeatData, UpdateBeatData, BeatSearchOptions, BeatStats } from './beat.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { IBeat, PaginatedResult } from '@/types';

export class BeatService implements IBeatService {
  async createBeat(producerId: string, data: CreateBeatData): Promise<IBeat> {
    try {
      const beat = new Beat({
        ...data,
        producerId,
        isDraft: true,
        isPublished: false,
        stats: {
          plays: 0,
          likes: 0,
          downloads: 0,
          shares: 0,
        },
      });

      await beat.save();
      logger.info(`New beat created: ${beat.title} by ${beat.producer}`);

      return beat;
    } catch (error) {
      logger.error('Create beat error:', error);
      throw error;
    }
  }

  async getBeatById(beatId: string): Promise<IBeat> {
    try {
      const beat = await Beat.findById(beatId);
      if (!beat) {
        throw new CustomError('Beat not found', 404);
      }

      return beat;
    } catch (error) {
      logger.error('Get beat by ID error:', error);
      throw error;
    }
  }

  async getBeatByIdPublic(beatId: string): Promise<IBeat> {
    try {
      const beat = await Beat.findOne({ _id: beatId, isPublished: true });
      if (!beat) {
        throw new CustomError('Beat not found or not published', 404);
      }

      return beat;
    } catch (error) {
      logger.error('Get public beat by ID error:', error);
      throw error;
    }
  }

  async updateBeat(beatId: string, producerId: string, data: UpdateBeatData): Promise<IBeat> {
    try {
      const beat = await Beat.findOne({ _id: beatId, producerId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      // Update allowed fields
      Object.keys(data).forEach(key => {
        if (data[key as keyof UpdateBeatData] !== undefined) {
          (beat as any)[key] = data[key as keyof UpdateBeatData];
        }
      });

      await beat.save();
      logger.info(`Beat updated: ${beat.title}`);

      return beat;
    } catch (error) {
      logger.error('Update beat error:', error);
      throw error;
    }
  }

  async deleteBeat(beatId: string, producerId: string): Promise<void> {
    try {
      const beat = await Beat.findOne({ _id: beatId, producerId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      await Beat.findByIdAndDelete(beatId);
      logger.info(`Beat deleted: ${beat.title}`);
    } catch (error) {
      logger.error('Delete beat error:', error);
      throw error;
    }
  }

  async getBeatsByProducer(producerId: string, options: BeatSearchOptions): Promise<PaginatedResult<IBeat>> {
    try {
      const {
        pagination = { page: 1, limit: 20 },
        sort = '-createdAt',
        query: search,
        filters = {},
        isPublished,
        isExclusive,
      } = options;
      
      const { page = 1, limit = 20 } = pagination;

      const query: any = { producerId };

      // Add published filter
      if (isPublished !== undefined) {
        query.isPublished = isPublished;
      }

      // Add exclusive filter
      if (isExclusive !== undefined) {
        query.isExclusive = isExclusive;
      }

      // Add search filter
      if (search) {
        query.$text = { $search: search };
      }

      // Add other filters
      if (filters.genre) {
        query.genre = filters.genre;
      }
      if (filters.bpm) {
        query.bpm = filters.bpm;
      }
      if (filters.musicalKey) {
        query.musicalKey = filters.musicalKey;
      }
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        query.price = {};
        if (filters.priceMin !== undefined) {
          query.price.$gte = filters.priceMin;
        }
        if (filters.priceMax !== undefined) {
          query.price.$lte = filters.priceMax;
        }
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const skip = (page - 1) * limit;
      const total = await Beat.countDocuments(query);
      const beats = await Beat.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return {
        data: beats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get beats by producer error:', error);
      throw error;
    }
  }

  async searchBeats(options: BeatSearchOptions): Promise<PaginatedResult<IBeat>> {
    try {
      const {
        pagination = { page: 1, limit: 20 },
        sort = '-createdAt',
        query: search,
        filters = {},
        producerId,
        isPublished = true, // Only search published beats by default
        isExclusive,
      } = options;
      
      const { page = 1, limit = 20 } = pagination;

      const query: any = { isPublished };

      // Add producer filter
      if (producerId) {
        query.producerId = producerId;
      }

      // Add exclusive filter
      if (isExclusive !== undefined) {
        query.isExclusive = isExclusive;
      }

      // Add search filter
      if (search) {
        query.$text = { $search: search };
      }

      // Add other filters
      if (filters.genre) {
        query.genre = filters.genre;
      }
      if (filters.bpm) {
        query.bpm = filters.bpm;
      }
      if (filters.musicalKey) {
        query.musicalKey = filters.musicalKey;
      }
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        query.price = {};
        if (filters.priceMin !== undefined) {
          query.price.$gte = filters.priceMin;
        }
        if (filters.priceMax !== undefined) {
          query.price.$lte = filters.priceMax;
        }
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const skip = (page - 1) * limit;
      const total = await Beat.countDocuments(query);
      const beats = await Beat.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return {
        data: beats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Search beats error:', error);
      throw error;
    }
  }

  async getFeaturedBeats(limit: number = 10): Promise<IBeat[]> {
    try {
      const beats = await Beat.find({ isPublished: true })
        .sort({ 'stats.plays': -1, 'stats.likes': -1, createdAt: -1 })
        .limit(limit);

      return beats;
    } catch (error) {
      logger.error('Get featured beats error:', error);
      throw error;
    }
  }

  async getTrendingBeats(limit: number = 10): Promise<IBeat[]> {
    try {
      // Trending based on recent plays and likes
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const beats = await Beat.find({
        isPublished: true,
        createdAt: { $gte: oneWeekAgo },
      })
        .sort({ 'stats.plays': -1, 'stats.likes': -1 })
        .limit(limit);

      return beats;
    } catch (error) {
      logger.error('Get trending beats error:', error);
      throw error;
    }
  }

  async getNewestBeats(limit: number = 10): Promise<IBeat[]> {
    try {
      const beats = await Beat.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(limit);

      return beats;
    } catch (error) {
      logger.error('Get newest beats error:', error);
      throw error;
    }
  }

  async getRelatedBeats(beatId: string, limit: number = 10): Promise<IBeat[]> {
    try {
      const beat = await Beat.findById(beatId);
      if (!beat) {
        throw new CustomError('Beat not found', 404);
      }

      const beats = await Beat.find({
        _id: { $ne: beatId },
        isPublished: true,
        $or: [
          { genre: beat.genre },
          { tags: { $in: beat.tags } },
          { producerId: beat.producerId },
        ],
      })
        .sort({ 'stats.plays': -1 })
        .limit(limit);

      return beats;
    } catch (error) {
      logger.error('Get related beats error:', error);
      throw error;
    }
  }

  async incrementPlays(beatId: string): Promise<void> {
    try {
      await Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.plays': 1 } });
    } catch (error) {
      logger.error('Increment plays error:', error);
      throw error;
    }
  }

  async incrementLikes(beatId: string): Promise<void> {
    try {
      await Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.likes': 1 } });
    } catch (error) {
      logger.error('Increment likes error:', error);
      throw error;
    }
  }

  async incrementDownloads(beatId: string): Promise<void> {
    try {
      await Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.downloads': 1 } });
    } catch (error) {
      logger.error('Increment downloads error:', error);
      throw error;
    }
  }

  async incrementShares(beatId: string): Promise<void> {
    try {
      await Beat.findByIdAndUpdate(beatId, { $inc: { 'stats.shares': 1 } });
    } catch (error) {
      logger.error('Increment shares error:', error);
      throw error;
    }
  }

  async publishBeat(beatId: string, producerId: string): Promise<IBeat> {
    try {
      const beat = await Beat.findOne({ _id: beatId, producerId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      beat.isPublished = true;
      beat.isDraft = false;
      await beat.save();

      logger.info(`Beat published: ${beat.title}`);
      return beat;
    } catch (error) {
      logger.error('Publish beat error:', error);
      throw error;
    }
  }

  async unpublishBeat(beatId: string, producerId: string): Promise<IBeat> {
    try {
      const beat = await Beat.findOne({ _id: beatId, producerId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      beat.isPublished = false;
      beat.isDraft = true;
      await beat.save();

      logger.info(`Beat unpublished: ${beat.title}`);
      return beat;
    } catch (error) {
      logger.error('Unpublish beat error:', error);
      throw error;
    }
  }

  async getBeatStats(producerId?: string): Promise<BeatStats> {
    try {
      const matchQuery = producerId ? { producerId } : {};

      const stats = await Beat.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalBeats: { $sum: 1 },
            totalPlays: { $sum: '$stats.plays' },
            totalLikes: { $sum: '$stats.likes' },
            totalDownloads: { $sum: '$stats.downloads' },
            totalRevenue: { $sum: { $multiply: ['$price', '$stats.downloads'] } },
            averagePrice: { $avg: '$price' },
          },
        },
      ]);

      const genreStats = await Beat.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const keyStats = await Beat.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$musicalKey', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const result = stats[0] || {
        totalBeats: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalDownloads: 0,
        totalRevenue: 0,
        averagePrice: 0,
      };

      return {
        ...result,
        topGenres: genreStats.map(item => ({ genre: item._id, count: item.count })),
        topKeys: keyStats.map(item => ({ key: item._id, count: item.count })),
      };
    } catch (error) {
      logger.error('Get beat stats error:', error);
      throw error;
    }
  }

  async getBeatAnalytics(beatId: string, producerId: string): Promise<any> {
    try {
      const beat = await Beat.findOne({ _id: beatId, producerId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      // TODO: Implement detailed analytics
      // This could include daily/weekly/monthly stats, geographic data, etc.
      
      return {
        beatId: beat._id,
        title: beat.title,
        stats: beat.stats,
        createdAt: beat.createdAt,
        updatedAt: beat.updatedAt,
      };
    } catch (error) {
      logger.error('Get beat analytics error:', error);
      throw error;
    }
  }
}
