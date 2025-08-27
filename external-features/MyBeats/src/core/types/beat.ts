export interface Beat {
  id: string;
  title: string;
  description?: string;
  artistId: string;
  artistName: string;
  genre: string;
  bpm: number;
  key: string;
  duration: number;
  artwork?: string;
  audioUrl: string;
  price: number;
  licenseType: 'basic' | 'premium' | 'exclusive';
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BeatCollaborator {
  id: string;
  beatId: string;
  userId: string;
  username: string;
  role: 'producer' | 'writer' | 'featured';
  splitPercentage: number;
}

export interface BeatFormData {
  title: string;
  description?: string;
  genre: string;
  bpm: string;
  key: string;
  price: number;
  licenseType: 'basic' | 'premium' | 'exclusive';
  tags: string[];
  audioFile?: File;
  artwork?: File;
}

export interface BeatFilter {
  artistId?: string;
  genre?: string;
  bpmRange?: { min: number; max: number };
  key?: string;
  priceRange?: { min: number; max: number };
  licenseType?: 'basic' | 'premium' | 'exclusive';
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'price' | 'bpm';
  sortOrder?: 'asc' | 'desc';
}

export type ActionType = 'play' | 'pause' | 'stop' | 'next' | 'previous';

