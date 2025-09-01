import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader, EmptyState } from "@/components/shared";
import { BeatCard } from "@/components/beat-card/BeatCard";
import { BeatGrid } from "@/components/beat-card/BeatGrid";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// Mock: master list of beats (would come from API / react-query)
interface BeatData { id: string; title: string; producer: string; artwork?: string; bpm: number; musicalKey: string; genre: string; price: number; }

const ALL_BEATS: BeatData[] = Array.from({ length: 150 }).map((_, i) => ({
  id: String(i + 1),
  title: `Favorite Beat #${i + 1}`,
  producer: ["MelodyMaster","UrbanBeats","SoulSound","LoopLord","Nova","EchoCraft"][i % 6],
  artwork: "/placeholder.svg",
  bpm: 80 + (i % 60),
  musicalKey: ["A Minor","C Major","F# Minor","D Minor","E Major"][i % 5],
  genre: ["Hip Hop","Trap","R&B","Drill","Afrobeat"][i % 5],
  price: 20 + (i % 10) * 5,
}));

// Simple spring-like fade/slide animation classes
// (Would be better with a dedicated animation lib; using Tailwind utilities here)
const appearClass = "opacity-0 translate-y-4 will-change-transform data-[inview='true']:opacity-100 data-[inview='true']:translate-y-0 transition duration-500 ease-out";

export function FavoritesLayout() {
  const { likedBeats, toggleLike } = useFavorites();
  const { playBeat, state: playerState } = useMediaPlayer();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(24); // page size / infinite scroll window
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter to beats that are liked
  const likedList = useMemo(() => ALL_BEATS.filter(b => likedBeats.has(b.id)), [likedBeats]);

  const filtered = useMemo(() => {
    if (!search.trim()) return likedList.slice(0, limit);
    const l = search.toLowerCase();
    return likedList.filter(b => b.title.toLowerCase().includes(l) || b.producer.toLowerCase().includes(l)).slice(0, limit);
  }, [likedList, search, limit]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      const first = entries[0];
      if (first.isIntersecting) {
        setLimit(prev => {
          const next = prev + 24;
          return next > likedList.length ? likedList.length : next;
        });
      }
    }, { root: null, rootMargin: "600px 0px 0px 0px", threshold: 0 });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [likedList.length, search]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(b => b.id)));
    }
  };

  const removeSelected = () => {
    const count = selected.size;
    if (count === 0) return;
    selected.forEach(id => toggleLike(id));
    toast({ title: t('favorites.removedFromFavorites'), description: t('favorites.beatsRemoved', { count: count }) });
    setSelected(new Set());
  };

  const handlePlayAll = () => {
    if (!filtered.length) return;
    // Play first; queue logic inside context will append others when individually played
    playBeat({
      id: filtered[0].id,
      title: filtered[0].title,
      producer: filtered[0].producer,
      artwork: filtered[0].artwork,
      bpm: filtered[0].bpm,
      key: filtered[0].musicalKey,
      genre: filtered[0].genre,
      price: filtered[0].price,
    });
    // Optionally queue others (simple naive approach)
    filtered.slice(1).forEach(b => playBeat({
      id: b.id, title: b.title, producer: b.producer, artwork: b.artwork, bpm: b.bpm, key: b.musicalKey, genre: b.genre, price: b.price
    }));
  };

  // Animate cards when they enter viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const els = Array.from(containerRef.current.querySelectorAll('[data-animate="fade-in"]')) as HTMLElement[];
    const animObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.setAttribute('data-inview','true');
          animObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '100px 0px' });
    els.forEach(el => animObs.observe(el));
    return () => animObs.disconnect();
  }, [filtered]);

  const isAllSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="container mx-auto p-6 mt-14 sm:mt-16" ref={containerRef}>
      <PageHeader title={t('favorites.title')} description={t('favorites.description')} />
      <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder={t('favorites.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setLimit(24); }} className="pl-10" />
        </div>
        {likedList.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handlePlayAll} disabled={!filtered.length}>
              <Play className="h-4 w-4 mr-2" />
              {t('favorites.playAll')}
            </Button>
            {!!selected.size && (
              <Button variant="destructive" onClick={removeSelected}>
                <Trash2 className="h-4 w-4 mr-2" />{t('favorites.remove')} ({selected.size})
              </Button>
            )}
          </div>
        )}
      </div>

      {likedList.length > 1 && filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Checkbox checked={isAllSelected} onCheckedChange={selectAllVisible} />
          <span className="text-sm text-muted-foreground">{t('favorites.selectAllVisible', { count: filtered.length })}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? t('favorites.noFavoritesMatchSearch') : t('favorites.noFavoritesYet')}
          description={search ? t('favorites.tryAdjustingSearch') : t('favorites.startExploringDescription')}
          icon="heart"
          action={!search ? { label: t('favorites.browseBeats'), onClick: () => (window.location.href = "/browse") } : undefined}
        />
      ) : (
        <>
          <BeatGrid className="mb-10">
            {filtered.map(beat => {
              const playing = playerState.currentBeat?.id === beat.id && playerState.isPlaying;
              return (
                <div
                  key={beat.id}
                  data-animate="fade-in"
                  className={cn(appearClass, "relative group")}
                >
                  {/* Selection checkbox overlay */}
                  <div className="absolute top-2 left-2 z-30">
                    <Checkbox
                      checked={selected.has(beat.id)}
                      onCheckedChange={() => toggleSelect(beat.id)}
                      className="bg-background/80 backdrop-blur-sm border-border/60"
                    />
                  </div>
                  <BeatCard
                    id={beat.id}
                    title={beat.title}
                    producer={beat.producer}
                    artwork={beat.artwork}
                    bpm={beat.bpm}
                    musicalKey={beat.musicalKey}
                    genre={beat.genre}
                    price={beat.price}
                    onPlay={() => playBeat({ id: beat.id, title: beat.title, producer: beat.producer, artwork: beat.artwork, bpm: beat.bpm, key: beat.musicalKey, genre: beat.genre, price: beat.price })}
                    onLike={() => toggleLike(beat.id, beat.title)}
                  />
                </div>
              );
            })}
          </BeatGrid>
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-10 -mt-6 flex items-center justify-center text-xs text-muted-foreground/70">
            {limit < likedList.length ? t('favorites.loadingMoreFavorites') : t('favorites.endOfFavorites')}
          </div>
        </>
      )}
    </div>
  );
}
