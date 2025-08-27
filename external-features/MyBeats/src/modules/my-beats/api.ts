import { useCallback, useMemo } from 'react';
import { useServices } from '@/providers/ServicesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Beat, BeatFormData, BeatFilter } from '@/core/types';

export function useMyBeatsAPI() {
  const { beatService, uploadDraftService } = useServices();
  const { user } = useAuth();

  const getMyBeats = useCallback(async (filter?: BeatFilter) => {
    if (!user) throw new Error('User not authenticated');
    return beatService.getUserBeats(user.id, filter);
  }, [beatService, user]);

  const getBeat = useCallback(async (beatId: string) => {
    return beatService.get(beatId);
  }, [beatService]);

  const updateBeat = useCallback(async (beatId: string, updates: Partial<BeatFormData>) => {
    if (!user) throw new Error('User not authenticated');
    return beatService.update(beatId, updates, user.id);
  }, [beatService, user]);

  const deleteBeat = useCallback(async (beatId: string) => {
    if (!user) throw new Error('User not authenticated');
    return beatService.remove(beatId, user.id);
  }, [beatService, user]);

  const publishBeat = useCallback(async (beatId: string) => {
    if (!user) throw new Error('User not authenticated');
    return beatService.publish(beatId, user.id);
  }, [beatService, user]);

  const unpublishBeat = useCallback(async (beatId: string) => {
    if (!user) throw new Error('User not authenticated');
    return beatService.unpublish(beatId, user.id);
  }, [beatService, user]);

  const getBeatAnalytics = useCallback(async (beatId: string) => {
    if (!user) throw new Error('User not authenticated');
    // Note: getBeatAnalytics method doesn't exist in interface, using incrementPlayCount as placeholder
    return beatService.incrementPlayCount(beatId);
  }, [beatService, user]);

  const getDraftBeats = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    return uploadDraftService.getUserDrafts(user.id);
  }, [uploadDraftService, user]);

  const deleteDraft = useCallback(async (draftId: string) => {
    if (!user) throw new Error('User not authenticated');
    return uploadDraftService.deleteDraft(draftId, user.id);
  }, [uploadDraftService, user]);

  const bulkUpdateBeats = useCallback(async (beatIds: string[], updates: Partial<BeatFormData>) => {
    if (!user) throw new Error('User not authenticated');
    const promises = beatIds.map(id => beatService.update(id, updates, user.id));
    return Promise.all(promises);
  }, [beatService, user]);

  const bulkDeleteBeats = useCallback(async (beatIds: string[]) => {
    if (!user) throw new Error('User not authenticated');
    const promises = beatIds.map(id => beatService.remove(id, user.id));
    return Promise.all(promises);
  }, [beatService, user]);

  const bulkPublishBeats = useCallback(async (beatIds: string[]) => {
    if (!user) throw new Error('User not authenticated');
    const promises = beatIds.map(id => beatService.publish(id, user.id));
    return Promise.all(promises);
  }, [beatService, user]);

  const bulkUnpublishBeats = useCallback(async (beatIds: string[]) => {
    if (!user) throw new Error('User not authenticated');
    const promises = beatIds.map(id => beatService.unpublish(id, user.id));
    return Promise.all(promises);
  }, [beatService, user]);

  return useMemo(() => ({
    getMyBeats,
    getBeat,
    updateBeat,
    deleteBeat,
    publishBeat,
    unpublishBeat,
    getBeatAnalytics,
    getDraftBeats,
    deleteDraft,
    bulkUpdateBeats,
    bulkDeleteBeats,
    bulkPublishBeats,
    bulkUnpublishBeats,
  }), [
    getMyBeats,
    getBeat,
    updateBeat,
    deleteBeat,
    publishBeat,
    unpublishBeat,
    getBeatAnalytics,
    getDraftBeats,
    deleteDraft,
    bulkUpdateBeats,
    bulkDeleteBeats,
    bulkPublishBeats,
    bulkUnpublishBeats,
  ]);
}
