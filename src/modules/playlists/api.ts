import { useState, useCallback } from 'react';
import { useServices } from '../../providers/ServicesProvider';
import { useAuth } from '../../providers/AuthProvider';
import { PlaylistFilter } from '../../core/types';

export function usePlaylistsAPI() {
  const { playlistService } = useServices();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserPlaylists = useCallback(async (filter?: PlaylistFilter) => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      return await playlistService.getUserPlaylists(user.id, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playlists');
      return [];
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  const createPlaylist = useCallback(async (input: PlaylistInput) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      return await playlistService.create(input, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  const updatePlaylist = useCallback(async (id: string, input: Partial<PlaylistInput>) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      return await playlistService.update(id, input, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update playlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  const deletePlaylist = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      await playlistService.remove(id, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  const sharePlaylist = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      return await playlistService.share(id, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share playlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  const addToPlaylist = useCallback(async (playlistId: string, beatId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      await playlistService.addItem(playlistId, beatId, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to playlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  const removeFromPlaylist = useCallback(async (playlistId: string, beatId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      await playlistService.removeItem(playlistId, beatId, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from playlist');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playlistService, user]);

  return {
    getUserPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    sharePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    loading,
    error,
  };
}

