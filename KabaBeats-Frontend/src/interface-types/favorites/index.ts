export interface FavoritesContextType {
  likedBeats: Set<string>;
  toggleLike: (beatId: string, beatTitle?: string) => void;
  isLiked: (beatId: string) => boolean;
}
