export interface BeatFormData {
  title: string;
  audioFile: File | null;
  artwork: File | null;
  bpm: string;
  key: string;
  genre: string;
  mood: string;
  description: string;
  tags: string[];
  allowFreeDownload: boolean;
  collaborators: { id?: string; name: string; email?: string; percent: number; role?: string }[];
}

export type ActionType = "published" | "drafted" | "scheduled" | null;

export const DEFAULT_FORM_DATA: BeatFormData = {
  title: "",
  audioFile: null,
  artwork: null,
  bpm: "",
  key: "",
  genre: "",
  mood: "",
  description: "",
  tags: [],
  allowFreeDownload: false,
  collaborators: []
};

export const GENRES = ["Hip Hop", "Trap", "R&B", "Pop", "LoFi", "EDM", "Drill", "Afrobeat", "Jazz", "Ambient"];
export const MOODS = ["Chill", "Energetic", "Dark", "Happy", "Sad", "Aggressive", "Romantic", "Mysterious"];
export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
