import { useEffect, useRef } from "react";
import { BeatCard } from "@/components/BeatCard";
import { BeatGrid } from "@/components/beat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

interface Beat {
  id: string;
  title: string;
  producer: string;
  artwork: string;
  bpm: number;
  key: string;
  musicalKey: string;
  genre: string;
  price: number;
  isLiked: boolean;
}

interface InfiniteScrollBeatsSectionProps {
  beats: Beat[];
  isLoadingMore: boolean;
  hasMore: boolean;
  onPlayBeat: (beat: Beat) => void;
  onLoadMore: () => void;
}

export function InfiniteScrollBeatsSection({ 
  beats, 
  isLoadingMore, 
  hasMore, 
  onPlayBeat,
  onLoadMore
}: InfiniteScrollBeatsSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);
  return (
    <section className="px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6">More Beats</h2>
        
        <BeatGrid className="mt-2">
          {beats.map((beat, index) => (
            <div
              key={beat.id}
              className="anim-new-beat-pop"
              style={{ animationDelay: `${(index % 20) * 50}ms` }}
            >
              <BeatCard
                {...beat}
                onPlay={() => onPlayBeat(beat)}
              />
            </div>
          ))}
        </BeatGrid>

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
        {isLoadingMore && (
          <BeatGrid className="mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
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

        {!hasMore && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You've reached the end! Check back for more beats.</p>
          </div>
        )}
      </div>
    </section>
  );
}
