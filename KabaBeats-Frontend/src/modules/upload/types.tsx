export interface BeatFormData {
  title: string;
  audioFile: File | null;
  artwork: File | null;
  stemsFile: File | null;
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
  stemsFile: null,
  bpm: "",
  key: "",
  genre: "",
  mood: "",
  description: "",
  tags: [],
  allowFreeDownload: false,
  collaborators: []
};

// Constants are now imported from ./constants.ts
