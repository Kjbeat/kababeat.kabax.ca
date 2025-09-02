import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Playlist, PlaylistsContextType } from '../interface-types/playlists';

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export const usePlaylists = () => {
  const context = useContext(PlaylistsContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistsProvider');
  }
  return context;
};

interface PlaylistsProviderProps {
  children: ReactNode;
}

export const PlaylistsProvider: React.FC<PlaylistsProviderProps> = ({ children }) => {
  // Initialize with some default playlists
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 'favorites',
      name: 'My Favorites',
      description: 'Your favorite beats',
      beats: [],
      createdAt: new Date(),
    },
    {
      id: 'hip-hop-vibes',
      name: 'Hip Hop Vibes',
      description: 'The best hip hop beats',
      beats: [],
      createdAt: new Date(),
    },
    {
      id: 'study-beats',
      name: 'Study Beats',
      description: 'Chill beats for studying',
      beats: [],
      createdAt: new Date(),
    },
    {
      id: 'workout-mix',
      name: 'Workout Mix',
      description: 'High energy beats for workouts',
      beats: [],
      createdAt: new Date(),
    },
  ]);
  const { toast } = useToast();

  const createPlaylist = (name: string, description?: string, initialBeatId?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      beats: initialBeatId ? [initialBeatId] : [],
      createdAt: new Date(),
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    
    toast({
      title: "Playlist created",
      description: `"${name}" has been created${initialBeatId ? ' with this beat' : ''}.`,
    });
  };

  const addBeatToPlaylist = (playlistId: string, beatId: string, beatTitle?: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        if (!playlist.beats.includes(beatId)) {
          return { ...playlist, beats: [...playlist.beats, beatId] };
        }
      }
      return playlist;
    }));

    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.beats.includes(beatId)) {
      toast({
        title: "Added to playlist",
        description: beatTitle 
          ? `"${beatTitle}" has been added to "${playlist.name}".`
          : `Beat added to "${playlist.name}".`,
      });
    }
  };

  const removeBeatFromPlaylist = (playlistId: string, beatId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, beats: playlist.beats.filter(id => id !== beatId) };
      }
      return playlist;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    
    if (playlist) {
      toast({
        title: "Playlist deleted",
        description: `"${playlist.name}" has been deleted.`,
      });
    }
  };

  const getBeatPlaylists = (beatId: string) => {
    return playlists.filter(playlist => playlist.beats.includes(beatId));
  };

  return (
    <PlaylistsContext.Provider value={{
      playlists,
      createPlaylist,
      addBeatToPlaylist,
      removeBeatFromPlaylist,
      deletePlaylist,
      getBeatPlaylists,
    }}>
      {children}
    </PlaylistsContext.Provider>
  );
};
