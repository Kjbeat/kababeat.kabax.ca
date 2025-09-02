export interface Beat {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  producer: string;
  description?: string;
  artwork?: string;
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags?: string[];
  price: number;
  basePrice?: number;
  salePrice?: number;
  allowFreeDownload?: boolean;
  isLiked?: boolean;
  duration?: number;
  audioUrl?: string;
  storageKey?: string; // R2 storage key for audio file
  stemsStorageKey?: string; // R2 storage key for stems ZIP file
  status?: string;
  scheduledDate?: Date | string;
  uploadDate?: string;
  date?: string;
  plays?: number;
  sales?: number;
  collaborators?: { id?: string; name: string; email?: string; percent: number; role?: string }[];
}

export interface MediaPlayerState {
  currentBeat: Beat | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  buffered: number; // seconds buffered
  isMuted: boolean;
  lastVolume: number; // for restoring after mute
  queue: Beat[]; // play queue
  queueIndex: number; // current index in queue
}

export interface MediaPlayerContextType {
  state: MediaPlayerState;
  playBeat: (beat: Beat) => void;
  pauseBeat: () => void;
  resumeBeat: () => void;
  stopBeat: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  nextBeat: () => void;
  prevBeat: () => void;
}
