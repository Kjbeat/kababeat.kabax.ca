import { UploadDraft, UploadFile, UploadPricing } from '@/core/types/upload';

export interface UploadDraftService {
  // Draft operations
  createDraft(userId: string): Promise<UploadDraft>;
  getDraft(id: string, userId: string): Promise<UploadDraft>;
  getUserDrafts(userId: string): Promise<UploadDraft[]>;
  updateDraft(id: string, data: Partial<UploadDraft>, userId: string): Promise<UploadDraft>;
  deleteDraft(id: string, userId: string): Promise<void>;
  
  // File operations
  addFile(draftId: string, file: UploadFile, userId: string): Promise<UploadFile>;
  removeFile(draftId: string, fileId: string, userId: string): Promise<void>;
  
  // Pricing
  updatePricing(draftId: string, pricing: UploadPricing, userId: string): Promise<UploadDraft>;
  
  // Publishing
  publishDraft(id: string, userId: string): Promise<string>; // Returns beat ID
}

