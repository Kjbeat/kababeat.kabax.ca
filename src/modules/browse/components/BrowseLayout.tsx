import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BeatCard } from "@/components/BeatCard";
import { BeatListItem } from "@/components/beat-card";
import { Button } from "@/components/ui/button";
import { Grid, LayoutList } from "lucide-react";
import { BrowseFilters } from "./BrowseFilters";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock data for demonstration (added createdAt + plays for sorting)
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
  createdAt: string; // ISO date
  plays: number; // popularity metric
}

// Base beats; more will be generated for infinite scroll demo
const initialBeats: Beat[] = [
  { id: "1", title: "Midnight Vibes", producer: "BeatMaker Pro", artwork: "", bpm: 140, key: "C Minor", genre: "Trap", price: 29.99, isLiked: false, createdAt: "2024-11-10T12:00:00Z", plays: 5400 },
  { id: "2", title: "Summer Dreams", producer: "LoFi King", artwork: "", bpm: 85, key: "G Major", genre: "LoFi", price: 19.99, isLiked: true, createdAt: "2025-03-02T08:30:00Z", plays: 9100 },
  { id: "3", title: "Electric Pulse", producer: "Synth Master", artwork: "", bpm: 128, key: "D Minor", genre: "EDM", price: 34.99, isLiked: false, createdAt: "2025-05-14T15:45:00Z", plays: 7800 },
  { id: "4", title: "Urban Stories", producer: "Hip Hop Head", artwork: "", bpm: 95, key: "F# Minor", genre: "Hip Hop", price: 24.99, isLiked: false, createdAt: "2025-01-22T10:10:00Z", plays: 4200 },
  { id: "5", title: "Cosmic Journey", producer: "Space Beats", artwork: "", bpm: 110, key: "A Major", genre: "Ambient", price: 39.99, isLiked: true, createdAt: "2025-06-30T09:15:00Z", plays: 12050 },
  { id: "6", title: "Neon Nights", producer: "Retro Wave", artwork: "", bpm: 125, key: "E Minor", genre: "Synthwave", price: 27.99, isLiked: false, createdAt: "2025-04-18T19:05:00Z", plays: 6650 },
  { id: "7", title: "Deep Focus", producer: "Study Beats", artwork: "", bpm: 70, key: "F Major", genre: "LoFi", price: 15.99, isLiked: false, createdAt: "2024-12-05T07:00:00Z", plays: 3000 },
  { id: "8", title: "Bass Drop", producer: "EDM Master", artwork: "", bpm: 130, key: "G Minor", genre: "EDM", price: 32.99, isLiked: true, createdAt: "2025-02-12T22:20:00Z", plays: 8400 },
];

// Simple mock beat generator (could be moved to shared utils)
function generateMoreBeats(offset: number, count: number): Beat[] {
  const genres = ["Trap", "LoFi", "EDM", "Hip Hop", "Ambient", "Synthwave"];
  const keys = ["C Minor", "G Major", "D Minor", "F# Minor", "A Major", "E Minor", "F Major", "G Minor"];
  return Array.from({ length: count }).map((_, i) => {
    const idNum = offset + i + 1;
    return {
      id: String(idNum + 8),
      title: `Generated Beat #${idNum}`,
      producer: `Producer ${((idNum % 7) + 1)}`,
      artwork: "",
      bpm: 70 + ((idNum * 7) % 200),
      key: keys[idNum % keys.length],
      genre: genres[idNum % genres.length],
      price: 15 + ((idNum * 3) % 40) + 0.99,
      isLiked: false,
      createdAt: new Date(Date.now() - idNum * 86400000).toISOString(),
      plays: 1000 + (idNum * 137) % 12000,
    } as Beat;
  });
}

export function BrowseLayout() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [beats, setBeats] = useState<Beat[]>(() => initialBeats);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMood, setSelectedMood] = useState("All");
  const [selectedKey, setSelectedKey] = useState("All");
  const [bpmRange, setBpmRange] = useState([60, 180]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false); // closed by default
  const { t } = useLanguage();

  const activeFilters = [
    selectedGenre !== "All" && selectedGenre,
    selectedMood !== "All" && selectedMood,
    selectedKey !== "All" && selectedKey,
    bpmRange[0] !== 60 && `${bpmRange[0]}-${bpmRange[1]} BPM`,
    priceRange[0] !== 0 && `$${priceRange[0]}-$${priceRange[1]}`,
  ].filter(Boolean);

  const clearFilter = (filter: string) => {
    if (["Hip Hop", "Trap", "R&B", "Pop", "LoFi", "EDM", "Drill", "Afrobeat", "Jazz", "Ambient"].includes(filter)) setSelectedGenre("All");
    if (["Chill", "Energetic", "Dark", "Happy", "Sad", "Aggressive", "Romantic", "Mysterious"].includes(filter)) setSelectedMood("All");
    if (["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].includes(filter)) setSelectedKey("All");
    if (filter.includes("BPM")) setBpmRange([60, 180]);
    if (filter.includes("$")) setPriceRange([0, 100]);
  };

  const clearAllFilters = () => {
    setSelectedGenre("All");
    setSelectedMood("All");
    setSelectedKey("All");
    setBpmRange([60, 180]);
    setPriceRange([0, 100]);
    setSearchQuery("");
  };

  // Filter + sort memoized
  const filteredBeats = useMemo(() => {
    const filtered = beats.filter(beat => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = beat.title.toLowerCase().includes(q) || beat.producer.toLowerCase().includes(q);
      const matchesGenre = selectedGenre === "All" || beat.genre === selectedGenre;
      const matchesBPM = beat.bpm >= bpmRange[0] && beat.bpm <= bpmRange[1];
      const matchesPrice = beat.price >= priceRange[0] && beat.price <= priceRange[1];
      const matchesKey = selectedKey === "All" || beat.key === selectedKey; // include key filter if used
      return matchesSearch && matchesGenre && matchesBPM && matchesPrice && matchesKey;
    });

    const sorted = filtered.slice();
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
          return b.plays - a.plays; // popularity by plays
        default:
          return 0;
      }
    });
    return sorted;
  }, [searchQuery, selectedGenre, selectedKey, bpmRange, priceRange, sortBy, beats]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Simulate fetch delay
    await new Promise(r => setTimeout(r, 900));
    const more = generateMoreBeats(beats.length - initialBeats.length, 16);
    setBeats(prev => [...prev, ...more]);
    if (beats.length >= 160) setHasMore(false); // cap demo
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, beats.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const { playBeat } = useMediaPlayer();

  const handlePlay = (beat: Beat) => {
    playBeat({
      id: beat.id,
      title: beat.title,
      producer: beat.producer,
      artwork: beat.artwork,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      price: beat.price,
      isLiked: beat.isLiked,
    });
  };

  return (
    <div>
      <div className="mt-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('browse.title')}</h1>
          <p className="text-muted-foreground">{t('browse.description')}</p>
        </div>

        {/* Filters */}
        <BrowseFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedMood={selectedMood}
          setSelectedMood={setSelectedMood}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          bpmRange={bpmRange}
          setBpmRange={setBpmRange}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilters={activeFilters}
          clearFilter={clearFilter}
          clearAllFilters={clearAllFilters}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {t('browse.showingResults')
              .replace('{count}', filteredBeats.length.toString())
              .replace('{total}', beats.length.toString())}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Beats Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat, index) => (
              <div
                key={beat.id}
                className="anim-new-beat-pop"
                style={{ animationDelay: `${(index % 20) * 40}ms` }}
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
                  onPlay={() => handlePlay(beat)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredBeats.map((beat, index) => (
              <div
                key={beat.id}
                className="anim-new-beat-pop"
                style={{ animationDelay: `${(index % 20) * 40}ms` }}
              >
                <BeatListItem
                  id={beat.id}
                  title={beat.title}
                  producer={beat.producer}
                  artwork={beat.artwork}
                  bpm={beat.bpm}
                  musicalKey={beat.key}
                  genre={beat.genre}
                  price={beat.price}
                  onPlay={() => handlePlay(beat)}
                />
              </div>
            ))}
          </div>
        )}
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-6 w-full" />

        {isLoadingMore && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground animate-pulse">{t('browse.loadingMore')}</div>
        )}
        {!hasMore && (
          <div className="text-center py-8 text-muted-foreground text-sm">{t('browse.endOfList')}</div>
        )}

        {filteredBeats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('browse.noBeatsFound')}</p>
            <Button variant="outline" onClick={clearAllFilters} className="mt-4">
              {t('browse.clearAllFilters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
