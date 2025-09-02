export interface Beat {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  producer: string;
  artwork?: string;
  bpm: number;
  key: string;
  genre: string;
  price: number;
  basePrice?: number;
  salePrice?: number;
  isLiked?: boolean;
  duration?: number;
  audioUrl?: string;
  storageKey?: string; // R2 storage key for audio file
  status?: string;
  uploadDate?: string;
  date?: string;
  plays?: number;
  sales?: number;
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
