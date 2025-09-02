import { Beat } from './beat.model';
import { IBeatService, CreateBeatRequest, UpdateBeatRequest, BeatQueryParams, BeatResponse, BeatStats } from './beat.interface';
import { CustomError } from '@/utils/errorHandler';
import { logger } from '@/config/logger';
import { MediaService } from '@/modules/media/media.service';
import { deleteStorageFile } from '@/utils/r2Storage';
// HLS imports removed
import mongoose from 'mongoose';

export class BeatService implements IBeatService {
  private mediaService = new MediaService();

  private async uploadFileToR2(file: Express.Multer.File, uploadUrl: string): Promise<void> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file.buffer,
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file to R2: ${response.statusText}`);
      }

      logger.info(`File uploaded to R2: ${file.originalname}`);
    } catch (error) {
      logger.error('Error uploading file to R2:', error);
      throw error;
    }
  }

  async createBeat(userId: string, beatData: CreateBeatRequest, audioFile: Express.Multer.File, artworkFile?: Express.Multer.File, stemsFile?: Express.Multer.File): Promise<BeatResponse> {
    try {
      // Validate user
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      // Check if beat with same title exists for this user
      const existingBeat = await Beat.findOne({ 
        title: beatData.title, 
        owner: userId 
      });
      
      if (existingBeat) {
        throw new CustomError('A beat with this title already exists', 400);
      }

      // Create beat document first (without files)
      const beat = new Beat({
        ...beatData,
        owner: userId,
        hlsProcessed: false, // Will be processed later
        status: beatData.status || (beatData.scheduledDate ? 'scheduled' : 'draft')
      });

      await beat.save();

      // Now upload files with the beat ID
      const beatId = (beat._id as any).toString();
      const audioUploadRequest = await this.mediaService.generateUploadUrl({
        userId,
        fileType: 'audio',
        originalName: audioFile.originalname,
        contentType: audioFile.mimetype,
        size: audioFile.size,
        beatId: beatId
      });
      
      // Upload artwork if provided
      let artworkStorageKey: string | undefined;
      let artworkUploadRequest: any = undefined;
      if (artworkFile) {
        artworkUploadRequest = await this.mediaService.generateUploadUrl({
          userId,
          fileType: 'artwork',
          originalName: artworkFile.originalname,
          contentType: artworkFile.mimetype,
          size: artworkFile.size,
          beatId: beatId
        });
        artworkStorageKey = artworkUploadRequest.key;
      }

      // Upload stems if provided
      let stemsStorageKey: string | undefined;
      let stemsUploadRequest: any = undefined;
      if (stemsFile) {
        stemsUploadRequest = await this.mediaService.generateUploadUrl({
          userId,
          fileType: 'audio', // Using audio type for stems
          originalName: stemsFile.originalname,
          contentType: stemsFile.mimetype,
          size: stemsFile.size,
          beatId: beatId
        });
        stemsStorageKey = stemsUploadRequest.key;
      }

      // Actually upload the files to R2
      await this.uploadFileToR2(audioFile, audioUploadRequest.uploadUrl);
      if (artworkFile && artworkStorageKey && artworkUploadRequest) {
        await this.uploadFileToR2(artworkFile, artworkUploadRequest.uploadUrl);
      }
      if (stemsFile && stemsStorageKey && stemsUploadRequest) {
        await this.uploadFileToR2(stemsFile, stemsUploadRequest.uploadUrl);
      }

      // Update beat with file information
      beat.storageKey = audioUploadRequest.key;
      beat.originalFileName = audioFile.originalname;
      if (artworkStorageKey) {
        beat.artwork = artworkStorageKey;
      }
      if (stemsStorageKey) {
        beat.stemsStorageKey = stemsStorageKey;
        beat.stemsOriginalFileName = stemsFile!.originalname;
        beat.stemsFileSize = stemsFile!.size;
      }
      beat.fileSize = audioFile.size;
      beat.audioFormat = audioFile.mimetype.includes('wav') ? 'wav' : 'mp3';
      
      await beat.save();

      // HLS processing removed - using direct audio URLs only

      logger.info(`Beat created successfully: ${beat._id} by user: ${userId}`);
      logger.info(`Beat data:`, {
        title: beat.title,
        storageKey: beat.storageKey,
        originalFileName: beat.originalFileName,
        status: beat.status,
        // HLS fields removed
      });

      return {
        success: true,
        data: beat,
        message: 'Beat created successfully'
      };
    } catch (error) {
      logger.error('Error creating beat:', error);
      throw error;
    }
  }

  async getBeatById(beatId: string): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findById(beatId)
        .populate('owner', 'username email avatar')
        .populate('collaborators.userId', 'username email avatar');

      if (!beat) {
        throw new CustomError('Beat not found', 404);
      }

      return {
        success: true,
        data: beat
      };
    } catch (error) {
      logger.error('Error getting beat by ID:', error);
      throw error;
    }
  }

  async getBeats(queryParams: BeatQueryParams): Promise<BeatResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        genre,
        mood,
        key,
        minBPM,
        maxBPM,
        minPrice,
        maxPrice,
        sortBy = 'newest',
        status,
        owner
      } = queryParams;

      // Build query
      const query: any = {};
      if (status) {
        query.status = status;
      }

      // Owner filter
      if (owner) {
        query.owner = owner;
      }

      logger.info('Beat query built:', query);

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Genre filter
      if (genre) {
        query.genre = genre;
      }

      // Mood filter
      if (mood) {
        query.mood = mood;
      }

      // Key filter
      if (key) {
        query.key = key;
      }

      // BPM range filter
      if (minBPM || maxBPM) {
        query.bpm = {};
        if (minBPM) query.bpm.$gte = minBPM;
        if (maxBPM) query.bpm.$lte = maxBPM;
      }

      // Price range filter - removed since beats now use license settings
      // Price filtering will be handled by user license settings

      // Build sort
      let sort: any = {};
      switch (sortBy) {
        case 'newest':
          sort = { uploadDate: -1 };
          break;
        case 'oldest':
          sort = { uploadDate: 1 };
          break;
        case 'price-low':
          sort = { uploadDate: -1 }; // Fallback to newest since no individual pricing
          break;
        case 'price-high':
          sort = { uploadDate: -1 }; // Fallback to newest since no individual pricing
          break;
        case 'popular':
          sort = { plays: -1 };
          break;
        case 'plays':
          sort = { plays: -1 };
          break;
        case 'likes':
          sort = { likes: -1 };
          break;
        default:
          sort = { uploadDate: -1 };
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const beats = await Beat.find(query)
        .populate('owner', 'username avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Beat.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        success: true,
        data: beats,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };
    } catch (error) {
      logger.error('Error getting beats:', error);
      throw error;
    }
  }

  async getUserBeats(userId: string, queryParams: BeatQueryParams): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      const queryWithOwner = { ...queryParams, owner: userId };
      return await this.getBeats(queryWithOwner);
    } catch (error) {
      logger.error('Error getting user beats:', error);
      throw error;
    }
  }

  async updateBeat(beatId: string, userId: string, updateData: UpdateBeatRequest): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findOne({ _id: beatId, owner: userId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      // Check for title conflicts if title is being updated
      if (updateData.title && updateData.title !== beat.title) {
        const existingBeat = await Beat.findOne({ 
          title: updateData.title, 
          owner: userId,
          _id: { $ne: beatId }
        });
        
        if (existingBeat) {
          throw new CustomError('A beat with this title already exists', 400);
        }
      }

      // Update beat
      Object.assign(beat, updateData);
      beat.lastModified = new Date();
      
      await beat.save();

      logger.info(`Beat updated: ${beatId} by user: ${userId}`);

      return {
        success: true,
        data: beat,
        message: 'Beat updated successfully'
      };
    } catch (error) {
      logger.error('Error updating beat:', error);
      throw error;
    }
  }

  async deleteBeat(beatId: string, userId: string): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findOne({ _id: beatId, owner: userId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      // Delete files from R2
      if (beat.storageKey) {
        try {
          await deleteStorageFile(beat.storageKey);
          logger.info(`Deleted audio file from R2: ${beat.storageKey}`);
        } catch (error) {
          logger.warn(`Failed to delete audio file from R2: ${beat.storageKey}`, error);
        }
      }
      if (beat.artwork) {
        try {
          await deleteStorageFile(beat.artwork);
          logger.info(`Deleted artwork file from R2: ${beat.artwork}`);
        } catch (error) {
          logger.warn(`Failed to delete artwork file from R2: ${beat.artwork}`, error);
        }
      }
      if (beat.stemsStorageKey) {
        try {
          await deleteStorageFile(beat.stemsStorageKey);
          logger.info(`Deleted stems file from R2: ${beat.stemsStorageKey}`);
        } catch (error) {
          logger.warn(`Failed to delete stems file from R2: ${beat.stemsStorageKey}`, error);
        }
      }

      await Beat.findByIdAndDelete(beatId);

      logger.info(`Beat deleted: ${beatId} by user: ${userId}`);

      return {
        success: true,
        message: 'Beat deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting beat:', error);
      throw error;
    }
  }

  async publishBeat(beatId: string, userId: string): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findOne({ _id: beatId, owner: userId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      beat.status = 'published';
      beat.lastModified = new Date();
      await beat.save();

      logger.info(`Beat published: ${beatId} by user: ${userId}`);

      return {
        success: true,
        data: beat,
        message: 'Beat published successfully'
      };
    } catch (error) {
      logger.error('Error publishing beat:', error);
      throw error;
    }
  }

  async unpublishBeat(beatId: string, userId: string): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findOne({ _id: beatId, owner: userId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      beat.status = 'draft';
      beat.lastModified = new Date();
      await beat.save();

      logger.info(`Beat unpublished: ${beatId} by user: ${userId}`);

      return {
        success: true,
        data: beat,
        message: 'Beat unpublished successfully'
      };
    } catch (error) {
      logger.error('Error unpublishing beat:', error);
      throw error;
    }
  }

  async scheduleBeat(beatId: string, userId: string, scheduledDate: Date): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      if (scheduledDate <= new Date()) {
        throw new CustomError('Scheduled date must be in the future', 400);
      }

      const beat = await Beat.findOne({ _id: beatId, owner: userId });
      if (!beat) {
        throw new CustomError('Beat not found or access denied', 404);
      }

      beat.status = 'scheduled';
      beat.scheduledDate = scheduledDate;
      beat.lastModified = new Date();
      await beat.save();

      logger.info(`Beat scheduled: ${beatId} for ${scheduledDate} by user: ${userId}`);

      return {
        success: true,
        data: beat,
        message: 'Beat scheduled successfully'
      };
    } catch (error) {
      logger.error('Error scheduling beat:', error);
      throw error;
    }
  }

  async getBeatStats(userId: string): Promise<BeatStats> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      const stats = await Beat.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalBeats: { $sum: 1 },
            publishedBeats: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
            },
            draftBeats: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
            },
            scheduledBeats: {
              $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
            },
            totalPlays: { $sum: '$plays' },
            totalLikes: { $sum: '$likes' },
            totalDownloads: { $sum: '$downloads' },
            totalSales: { $sum: '$sales' },
            totalRevenue: { $sum: { $multiply: ['$sales', '$basePrice'] } }
          }
        }
      ]);

      return stats[0] || {
        totalBeats: 0,
        publishedBeats: 0,
        draftBeats: 0,
        scheduledBeats: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalDownloads: 0,
        totalSales: 0,
        totalRevenue: 0
      };
    } catch (error) {
      logger.error('Error getting beat stats:', error);
      throw error;
    }
  }

  async incrementPlays(beatId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      await Beat.findByIdAndUpdate(beatId, { $inc: { plays: 1 } });
    } catch (error) {
      logger.error('Error incrementing plays:', error);
      throw error;
    }
  }

  async incrementLikes(beatId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      await Beat.findByIdAndUpdate(beatId, { $inc: { likes: 1 } });
    } catch (error) {
      logger.error('Error incrementing likes:', error);
      throw error;
    }
  }

  async incrementDownloads(beatId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      await Beat.findByIdAndUpdate(beatId, { $inc: { downloads: 1 } });
    } catch (error) {
      logger.error('Error incrementing downloads:', error);
      throw error;
    }
  }

  async incrementSales(beatId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      await Beat.findByIdAndUpdate(beatId, { $inc: { sales: 1 } });
    } catch (error) {
      logger.error('Error incrementing sales:', error);
      throw error;
    }
  }

  // HLS streaming method removed

  async searchBeats(query: string, filters?: Partial<BeatQueryParams>): Promise<BeatResponse> {
    try {
      const searchParams = {
        ...filters,
        search: query
      };
      return await this.getBeats(searchParams);
    } catch (error) {
      logger.error('Error searching beats:', error);
      throw error;
    }
  }

  async getArtworkUrl(beatId: string): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findById(beatId);
      if (!beat) {
        throw new CustomError('Beat not found', 404);
      }

      if (!beat.artwork) {
        throw new CustomError('No artwork found for this beat', 404);
      }

      // Generate public URL for artwork
      const { generatePublicUrl } = await import('@/utils/r2Storage');
      const artworkUrl = generatePublicUrl(beat.artwork);

      return {
        success: true,
        data: { artworkUrl } as any,
        message: 'Artwork URL generated successfully'
      };
    } catch (error) {
      logger.error('Error getting artwork URL:', error);
      throw error;
    }
  }

  async getAudioUrl(beatId: string): Promise<BeatResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(beatId)) {
        throw new CustomError('Invalid beat ID', 400);
      }

      const beat = await Beat.findById(beatId);
      if (!beat) {
        throw new CustomError('Beat not found', 404);
      }

      if (!beat.storageKey) {
        throw new CustomError('No audio file found for this beat', 404);
      }

      // Generate public URL for audio
      const { generatePublicUrl } = await import('@/utils/r2Storage');
      const audioUrl = generatePublicUrl(beat.storageKey);

      return {
        success: true,
        data: { audioUrl } as any,
        message: 'Audio URL generated successfully'
      };
    } catch (error) {
      logger.error('Error getting audio URL:', error);
      throw error;
    }
  }

  // HLS processing method removed
}

export const beatService = new BeatService();