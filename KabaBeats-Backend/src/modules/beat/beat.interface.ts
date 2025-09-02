import { Request } from 'express';
import { IBeat } from './beat.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface CreateBeatRequest {
  title: string;
  producer: string;
  description?: string;
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags?: string[];
  allowFreeDownload?: boolean;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  collaborators?: {
    userId?: string;
    name: string;
    email: string;
    percent: number;
    role?: string;
  }[];
  scheduledDate?: Date;
}

export interface UpdateBeatRequest {
  title?: string;
  producer?: string;
  description?: string;
  bpm?: number;
  key?: string;
  genre?: string;
  mood?: string;
  tags?: string[];
  allowFreeDownload?: boolean;
  collaborators?: {
    userId?: string;
    name: string;
    email: string;
    percent: number;
    role?: string;
  }[];
  scheduledDate?: Date;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
}

export interface BeatQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  mood?: string;
  key?: string;
  minBPM?: number;
  maxBPM?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular' | 'plays' | 'likes';
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  owner?: string;
}

export interface BeatResponse {
  success: boolean;
  data?: IBeat | IBeat[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BeatStats {
  totalBeats: number;
  publishedBeats: number;
  draftBeats: number;
  scheduledBeats: number;
  totalPlays: number;
  totalLikes: number;
  totalDownloads: number;
  totalSales: number;
  totalRevenue: number;
}

export interface IBeatService {
  createBeat(userId: string, beatData: CreateBeatRequest, audioFile: Express.Multer.File, artworkFile?: Express.Multer.File, stemsFile?: Express.Multer.File): Promise<BeatResponse>;
  getBeatById(beatId: string): Promise<BeatResponse>;
  getBeats(queryParams: BeatQueryParams): Promise<BeatResponse>;
  getUserBeats(userId: string, queryParams: BeatQueryParams): Promise<BeatResponse>;
  updateBeat(beatId: string, userId: string, updateData: UpdateBeatRequest): Promise<BeatResponse>;
  updateBeatWithFiles(beatId: string, userId: string, updateData: UpdateBeatRequest, audioFile?: Express.Multer.File, artworkFile?: Express.Multer.File, stemsFile?: Express.Multer.File): Promise<BeatResponse>;
  deleteBeat(beatId: string, userId: string): Promise<BeatResponse>;
  publishBeat(beatId: string, userId: string): Promise<BeatResponse>;
  unpublishBeat(beatId: string, userId: string): Promise<BeatResponse>;
  scheduleBeat(beatId: string, userId: string, scheduledDate: Date): Promise<BeatResponse>;
  getBeatStats(userId: string): Promise<BeatStats>;
  incrementPlays(beatId: string): Promise<void>;
  incrementLikes(beatId: string): Promise<void>;
  incrementDownloads(beatId: string): Promise<void>;
  incrementSales(beatId: string): Promise<void>;
  searchBeats(query: string, filters?: Partial<BeatQueryParams>): Promise<BeatResponse>;
}

export interface IBeatController {
  createBeat(req: AuthenticatedRequest, res: any): Promise<void>;
  getBeatById(req: Request, res: any): Promise<void>;
  getBeats(req: Request, res: any): Promise<void>;
  getUserBeats(req: AuthenticatedRequest, res: any): Promise<void>;
  updateBeat(req: AuthenticatedRequest, res: any): Promise<void>;
  updateBeatWithFiles(req: AuthenticatedRequest, res: any): Promise<void>;
  deleteBeat(req: AuthenticatedRequest, res: any): Promise<void>;
  publishBeat(req: AuthenticatedRequest, res: any): Promise<void>;
  unpublishBeat(req: AuthenticatedRequest, res: any): Promise<void>;
  scheduleBeat(req: AuthenticatedRequest, res: any): Promise<void>;
  getBeatStats(req: AuthenticatedRequest, res: any): Promise<void>;
  incrementPlays(req: Request, res: any): Promise<void>;
  incrementLikes(req: Request, res: any): Promise<void>;
  incrementDownloads(req: Request, res: any): Promise<void>;
  incrementSales(req: Request, res: any): Promise<void>;
  searchBeats(req: Request, res: any): Promise<void>;
}