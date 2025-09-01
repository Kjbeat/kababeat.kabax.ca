export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  isPublic: boolean;
  trackCount: number;
  updatedAt: string;
  curator: string;
}
