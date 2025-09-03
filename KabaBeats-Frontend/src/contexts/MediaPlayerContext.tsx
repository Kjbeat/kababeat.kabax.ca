import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Beat, MediaPlayerState, MediaPlayerContextType } from '../interface-types/media-player';
// HLS removed - using direct audio URLs only

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export function MediaPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MediaPlayerState>(() => {
    let vol = 0.7;
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('mediaPlayerVolume');
      if (stored) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) vol = Math.min(1, Math.max(0, parsed));
      }
    }
    return {
      currentBeat: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: vol,
      buffered: 0,
      isMuted: false,
      lastVolume: vol,
  queue: [],
  queueIndex: -1,
    };
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // HLS removed - no longer needed

  const internalStartBeat = (beat: Beat, indexInQueue: number) => {
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    // Set up audio event listeners
    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        buffered: audio.buffered.length > 0 ? audio.buffered.end(0) : 0,
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    };

    // Remove existing listeners
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);

    // Add new listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set volume
    audio.volume = state.volume;
    audio.muted = state.isMuted;

    // Add error handling
    audio.onerror = (e) => {
      console.error('Audio error:', e);
    };

    audio.onloadstart = () => {
      console.log('Audio loading started');
    };

    audio.oncanplay = () => {
      console.log('Audio can play');
    };

    // Load audio source - using direct audio URLs only
    console.log('Loading audio for beat:', {
      audioUrl: beat.audioUrl,
      title: beat.title
    });
    
    if (beat.audioUrl) {
      audio.src = beat.audioUrl;
      audio.play().catch(console.error);
    } else {
      console.error('No audio URL available for playback');
    }

    setState(prev => ({
      ...prev,
      currentBeat: beat,
      isPlaying: true,
      currentTime: 0,
      buffered: 0,
      queueIndex: indexInQueue,
    }));
  };

  const playBeat = (beat: Beat) => {
    if (state.currentBeat?.id === beat.id) {
      // Restart same beat from beginning instead of toggling
      internalStartBeat(beat, state.queueIndex === -1 ? 0 : state.queueIndex);
      return;
    }

    setState(prev => {
      // If beat already in queue use its index; else append
      const existingIndex = prev.queue.findIndex(b => b.id === beat.id);
      if (existingIndex !== -1) {
        // Start existing
        setTimeout(() => internalStartBeat(prev.queue[existingIndex], existingIndex));
        return prev;
      }
      const newQueue = [...prev.queue, beat];
      const newIndex = newQueue.length - 1;
      setTimeout(() => internalStartBeat(beat, newIndex));
      return { ...prev, queue: newQueue };
    });
  };

  const nextBeat = () => {
    setState(prev => {
      if (prev.queue.length <= 1) return prev; // nothing to advance
      const nextIndex = (prev.queueIndex + 1) % prev.queue.length;
      const next = prev.queue[nextIndex];
      setTimeout(() => internalStartBeat(next, nextIndex));
      return prev;
    });
  };

  const prevBeat = () => {
    setState(prev => {
      if (prev.queue.length <= 1) return prev;
      const prevIndex = (prev.queueIndex - 1 + prev.queue.length) % prev.queue.length;
      const beat = prev.queue[prevIndex];
      setTimeout(() => internalStartBeat(beat, prevIndex));
      return prev;
    });
  };

  const pauseBeat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumeBeat = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    setState(prev => ({ ...prev, isPlaying: true }));
  };

  const stopBeat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // HLS cleanup removed
    setState(prev => ({
      ...prev,
      currentBeat: null,
      isPlaying: false,
      currentTime: 0,
    }));
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setState(prev => ({ ...prev, volume, lastVolume: volume, isMuted: volume === 0 ? true : prev.isMuted && volume === 0 }));
  };

  const toggleMute = () => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      if (newMuted) {
        return { ...prev, isMuted: true, lastVolume: prev.volume };
      } else {
        return { ...prev, isMuted: false, volume: prev.lastVolume || 0.7 };
      }
    });
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setState(prev => ({ ...prev, currentTime: time }));
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // Simulate time updates
  React.useEffect(() => {
    if (!state.isPlaying || !state.currentBeat) return;

    const TICK_MS = 200; // 5 updates per second for smoother progress
    const SEC_PER_TICK = TICK_MS / 1000;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.currentBeat) return prev;
  const newTime = prev.currentTime + SEC_PER_TICK;
  const ended = newTime >= prev.duration;
  // Keep buffered only slightly ahead of playback (max 2s lead) to avoid misleading near-complete bar
  const targetBuffered = newTime + 2; // 2 seconds look‑ahead
  const nextBuffered = Math.min(prev.duration, Math.max(prev.buffered, targetBuffered));
        const updated: MediaPlayerState = {
          ...prev,
            // Loop: when ended, restart from 0 and keep playing
            currentTime: ended ? 0 : newTime,
            isPlaying: ended ? true : prev.isPlaying,
            // On loop restart, reset buffered to small head start (0) so it refills naturally
            buffered: ended ? 0 : nextBuffered,
        };
        // Persist only volume (no longer storing/resuming position intentionally)
        if (typeof window !== 'undefined') {
          try { window.localStorage.setItem('mediaPlayerVolume', String(updated.volume)); } catch { /* ignore */ }
        }
        return updated;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [state.isPlaying, state.currentBeat]);

  // Persist volume changes immediately
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem('mediaPlayerVolume', String(state.volume)); } catch {
      // ignore
    }
  }, [state.volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <MediaPlayerContext.Provider
      value={{
        state,
        playBeat,
        pauseBeat,
        resumeBeat,
        stopBeat,
        setVolume,
        seekTo,
  togglePlayPause,
  toggleMute,
  nextBeat,
  prevBeat,
      }}
    >
      {children}
    </MediaPlayerContext.Provider>
  );
}

// eslint-disable-next-line
export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};