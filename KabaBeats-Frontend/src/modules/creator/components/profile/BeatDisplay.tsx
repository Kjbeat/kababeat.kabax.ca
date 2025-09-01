import { useState, useCallback, useEffect, useRef } from "react";
import { BeatCard } from "@/components/beat-card/BeatCard";
import { BeatListItem } from "@/components/beat-card/BeatListItem";
import { BeatGrid } from "@/components/beat-card/BeatGrid";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface Beat {
  id: string;
  title: string;
  producer: string;
  artwork: string;
  bpm: number;
  key: string;
  genre: string;
  price: number;
  isLiked: boolean;
}

interface BeatDisplayProps {
  beats: Beat[];
  emptyMessage?: string;
}

// Function to generate more beats with random names
const generateMoreBeats = (offset: number, count: number): Beat[] => {
  const genres = ["Afrobeats", "Amapiano", "Afrotrap", "Hiplife", "Dancehall", "Afrofusion", "Kwaito", "Azonto"];
  const keys = ["C Minor", "G Major", "D Minor", "F# Minor", "A Major", "E Minor", "Bb Major", "C# Minor"];
  const producers = ["AfroKing", "Lagos Producer", "Accra Beats", "Naija Sound", "SA Vibes", "Kenya Flow", "Dar Beats"];
  const titles = [
    "Sunset Vibes", "Lagos Nights", "Afro Dream", "Rhythm Divine", "Soulful Journey", 
    "Tribal Fusion", "Golden Hour", "Desert Moon", "Ocean Waves", "Mountain Echo",
    "Jungle Beat", "City Lights", "Coastal Breeze", "Savanna Groove", "Island Life"
  ];
  
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const randTitle = titles[Math.floor(Math.random() * titles.length)];
    const randProducer = producers[Math.floor(Math.random() * producers.length)];
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    const randGenre = genres[Math.floor(Math.random() * genres.length)];
    const uniqueId = `beat-${offset + i + 1}-${now}-${Math.random().toString(36).slice(2,7)}`;
    
    return {
      id: uniqueId,
      title: `${randTitle} ${offset + i + 1}`,
      producer: randProducer,
      artwork: "",
      bpm: Math.floor(Math.random() * 60) + 80,
      key: randKey,
      genre: randGenre,
      price: Math.floor(Math.random() * 40) + 15,
      isLiked: Math.random() > 0.8,
    };
  });
};

export function BeatDisplay({ beats: initialBeats, emptyMessage = "No beats available" }: BeatDisplayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { playBeat, state: playerState } = useMediaPlayer();
  const { t } = useLanguage();
  
  // Infinite scroll state
  const [beats, setBeats] = useState<Beat[]>(initialBeats);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Convert our beat to what the media player expects
  const handlePlayBeat = (beat: Beat) => {
    // The media player expects the same structure as our Beat interface
    playBeat({
      id: beat.id,
      title: beat.title,
      producer: beat.producer,
      artwork: beat.artwork || '',
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      price: beat.price,
      isLiked: beat.isLiked,
      duration: 180, // Placeholder duration in seconds (3 minutes)
    });
  };

  const loadMoreBeats = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newBeats = generateMoreBeats(beats.length, 8);
    setBeats(prev => [...prev, ...newBeats]);
    
    // Simulate end of data after 80 beats
    if (beats.length >= 80) {
      setHasMore(false);
    }
    
    setIsLoadingMore(false);
  }, [beats.length, isLoadingMore, hasMore]);
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreBeats();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMoreBeats]);

  if (!beats.length && !isLoadingMore) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <div className="inline-flex items-center rounded-md border border-input bg-transparent p-1">
          <Button
            variant="ghost"
            size="sm"
            className={`${viewMode === 'grid' ? 'bg-muted' : ''} rounded-sm px-2.5`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${viewMode === 'list' ? 'bg-muted' : ''} rounded-sm px-2.5`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <BeatGrid>
          {beats.map((beat, index) => (
            <div 
              key={beat.id} 
              className="hover-scale" 
              style={{ 
                animationDelay: `${(index % 8) * 100}ms`,
                animation: 'beatPopIn 0.6s ease-out forwards'
              }}
            >
              <BeatCard
                id={beat.id}
                title={beat.title}
                producer={beat.producer}
                artwork={beat.artwork}
                bpm={beat.bpm}
                musicalKey={beat.key}
                genre={beat.genre}
                price={beat.price}
                onPlay={() => handlePlayBeat(beat)}
              />
            </div>
          ))}
        </BeatGrid>
      ) : (
        <div className="space-y-4">
          {beats.map((beat, index) => (
            <div 
              key={beat.id}
              style={{ 
                animationDelay: `${(index % 8) * 100}ms`,
                animation: 'beatPopIn 0.6s ease-out forwards'
              }}
            >
              <BeatListItem
                key={beat.id}
                id={beat.id}
                title={beat.title}
                producer={beat.producer}
                artwork={beat.artwork}
                bpm={beat.bpm}
                musicalKey={beat.key}
                genre={beat.genre}
                price={beat.price}
                onPlay={() => handlePlayBeat(beat)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Intersection Observer Sentinel */}
      <div ref={sentinelRef} className="h-4 w-full" />

      {/* Loading Animation */}
      {isLoadingMore && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="animate-bounce">
            <Spinner size={32} />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading more beats...</p>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {isLoadingMore && viewMode === 'grid' && (
        <BeatGrid className="mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="space-y-3 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </BeatGrid>
      )}

      {/* Loading Skeleton List */}
      {isLoadingMore && viewMode === 'list' && (
        <div className="space-y-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="animate-pulse flex items-center gap-4 p-4 rounded-lg border border-border"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end! Check back for more beats.</p>
        </div>
      )}
    </div>
  );
}
