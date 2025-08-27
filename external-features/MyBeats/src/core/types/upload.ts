import { BeatFormData, BeatCollaborator } from './beat';

export interface UploadDraft {
  id: string;
  userId: string;
  step: number;
  data: Partial<BeatFormData>;
  collaborators: BeatCollaborator[];
  pricing: UploadPricing;
  files: UploadFile[];
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadFile {
  id: string;
  draftId: string;
  type: 'audio' | 'artwork';
  filename: string;
  size: number;
  url?: string;
  uploadedAt: Date;
}

export interface UploadPricing {
  basicPrice: number;
  premiumPrice: number;
  exclusivePrice: number;
  currency: string;
}

export interface UploadProgress {
  step: number;
  totalSteps: number;
  isComplete: boolean;
}

