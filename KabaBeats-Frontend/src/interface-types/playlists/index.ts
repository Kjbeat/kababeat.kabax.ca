export interface Playlist {
  id: string;
  name: string;
  description?: string;
  beats: string[]; // Array of beat IDs
  createdAt: Date;
}

export interface PlaylistsContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string, initialBeatId?: string) => void;
  addBeatToPlaylist: (playlistId: string, beatId: string, beatTitle?: string) => void;
  removeBeatFromPlaylist: (playlistId: string, beatId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  getBeatPlaylists: (beatId: string) => Playlist[];
}
