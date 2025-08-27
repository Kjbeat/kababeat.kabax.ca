import { useCallback, useMemo, useState } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { BeatFormData, BeatCollaborator, UploadDraft, UploadFile, UploadPricing } from '@/core/types';

export function useUploadAPI() {
  const { uploadDraftService, beatService, storageService } = useServices();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = useCallback(async (): Promise<UploadDraft | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const draft = await uploadDraftService.createDraft(user.id);
      return draft;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const updateDraft = useCallback(async (
    draftId: string, 
    data: Partial<UploadDraft>
  ): Promise<UploadDraft | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const draft = await uploadDraftService.updateDraft(draftId, data, user.id);
      return draft;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const addFile = useCallback(async (
    draftId: string, 
    file: UploadFile
  ): Promise<UploadFile | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const uploadedFile = await uploadDraftService.addFile(draftId, file, user.id);
      return uploadedFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add file');
      return null;
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const removeFile = useCallback(async (
    draftId: string, 
    fileId: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await uploadDraftService.removeFile(draftId, fileId, user.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove file');
      return false;
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const updatePricing = useCallback(async (
    draftId: string, 
    pricing: UploadPricing
  ): Promise<UploadDraft | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const draft = await uploadDraftService.updatePricing(draftId, pricing, user.id);
      return draft;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pricing');
      return null;
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const publishDraft = useCallback(async (draftId: string): Promise<string | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const beatId = await uploadDraftService.publishDraft(draftId, user.id);
      return beatId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const uploadAudioFile = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = await storageService.uploadAudio(file, user.id);
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio file');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storageService, user]);

  const uploadArtworkFile = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = await storageService.uploadArtwork(file, user.id);
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload artwork file');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storageService, user]);

  const getUserDrafts = useCallback(async (): Promise<UploadDraft[]> => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const drafts = await uploadDraftService.getUserDrafts(user.id);
      return drafts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user drafts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [uploadDraftService, user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const api = useMemo(() => ({
    createDraft,
    updateDraft,
    addFile,
    removeFile,
    updatePricing,
    publishDraft,
    uploadAudioFile,
    uploadArtworkFile,
    getUserDrafts,
    clearError,
    loading,
    error
  }), [
    createDraft,
    updateDraft,
    addFile,
    removeFile,
    updatePricing,
    publishDraft,
    uploadAudioFile,
    uploadArtworkFile,
    getUserDrafts,
    clearError,
    loading,
    error
  ]);

  return api;
}
