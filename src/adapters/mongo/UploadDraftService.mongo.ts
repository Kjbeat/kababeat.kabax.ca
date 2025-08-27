import { UploadDraftService } from '../../core/services/UploadDraftService';
import { UploadDraft, UploadFile, UploadPricing } from '../../core/types';

export class UploadDraftServiceMongo implements UploadDraftService {
  async createDraft(userId: string): Promise<UploadDraft> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getDraft(id: string, userId: string): Promise<UploadDraft> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getUserDrafts(userId: string): Promise<UploadDraft[]> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async updateDraft(id: string, data: Partial<UploadDraft>, userId: string): Promise<UploadDraft> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async deleteDraft(id: string, userId: string): Promise<void> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async addFile(draftId: string, file: UploadFile, userId: string): Promise<UploadFile> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async removeFile(draftId: string, fileId: string, userId: string): Promise<void> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async updatePricing(draftId: string, pricing: UploadPricing, userId: string): Promise<UploadDraft> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async publishDraft(id: string, userId: string): Promise<string> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }
}
