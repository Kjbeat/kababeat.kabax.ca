export interface Playlist {
  id: string;
  name: string;
  description?: string;
  curatorId: string;
  curatorName: string;
  coverImage?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  items: PlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  beatId: string;
  addedAt: Date;
  addedBy: string;
  position: number;
}

export interface PlaylistInput {
  name: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
}

export interface PlaylistFilter {
  curatorId?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ShareResult {
  success: boolean;
  url?: string;
  error?: string;
}
