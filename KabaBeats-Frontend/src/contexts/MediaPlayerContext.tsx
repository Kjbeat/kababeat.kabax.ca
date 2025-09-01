import React, { createContext, useContext, useState, useRef } from 'react';

interface Beat {
  id: string;
  title: string;
  producer: string;
  artwork?: string;
  bpm: number;
  key: string;
  genre: string;
  price: number;
  isLiked?: boolean;
  duration?: number;
}

interface MediaPlayerState {
  currentBeat: Beat | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  buffered: number; // seconds buffered
  isMuted: boolean;
  lastVolume: number; // for restoring after mute
  queue: Beat[]; // play queue
  queueIndex: number; // current index in queue
}

interface MediaPlayerContextType {
  state: MediaPlayerState;
  playBeat: (beat: Beat) => void;
  pauseBeat: () => void;
  resumeBeat: () => void;
  stopBeat: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  nextBeat: () => void;
  prevBeat: () => void;
}

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

  const internalStartBeat = (beat: Beat, indexInQueue: number) => {
    // Stop any existing audio (placeholder)
    if (audioRef.current) audioRef.current.pause();
    const mockDuration = 120 + Math.random() * 60; // 2-3 minutes
    setState(prev => ({
      ...prev,
      currentBeat: beat,
      isPlaying: true,
      currentTime: 0,
      buffered: 0,
      duration: mockDuration,
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
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumeBeat = () => {
    setState(prev => ({ ...prev, isPlaying: true }));
  };

  const stopBeat = () => {
    setState(prev => ({
      ...prev,
      currentBeat: null,
      isPlaying: false,
      currentTime: 0,
    }));
  };

  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume, lastVolume: volume, isMuted: volume === 0 ? true : prev.isMuted && volume === 0 }));
  };

  const toggleMute = () => {
    setState(prev => {
      if (prev.isMuted) {
        return { ...prev, isMuted: false, volume: prev.lastVolume || 0.7 };
      }
      return { ...prev, isMuted: true, volume: 0 };
    });
  };

  const seekTo = (time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  };

  const togglePlayPause = () => {
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