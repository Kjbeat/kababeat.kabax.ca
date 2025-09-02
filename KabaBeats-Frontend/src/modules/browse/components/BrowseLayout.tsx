import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BeatCard } from "@/components/BeatCard";
import { BeatListItem } from "@/components/beat-card";
import { Button } from "@/components/ui/button";
import { Grid, LayoutList } from "lucide-react";
import { BrowseFilters } from "./BrowseFilters";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

// Beat interface matching backend
interface Beat {
  _id: string;
  id: string;
  title: string;
  producer: string;
  artwork?: string;
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags: string[];
  basePrice: number;
  salePrice?: number;
  isExclusive: boolean;
  allowFreeDownload: boolean;
  duration?: number;
  plays: number;
  likes: number;
  downloads: number;
  sales: number;
  uploadDate: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  owner: {
    _id: string;
    username: string;
    avatar?: string;
  };
  hlsUrl?: string;
  hlsProcessed: boolean;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function BrowseLayout() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMood, setSelectedMood] = useState("All");
  const [selectedKey, setSelectedKey] = useState("All");
  const [bpmRange, setBpmRange] = useState([60, 180]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  // API functions
  const fetchBeats = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: sortBy,
        status: 'published'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedGenre !== "All") params.append('genre', selectedGenre);
      if (selectedMood !== "All") params.append('mood', selectedMood);
      if (selectedKey !== "All") params.append('key', selectedKey);
      if (bpmRange[0] !== 60) params.append('minBPM', bpmRange[0].toString());
      if (bpmRange[1] !== 180) params.append('maxBPM', bpmRange[1].toString());
      if (priceRange[0] !== 0) params.append('minPrice', priceRange[0].toString());
      if (priceRange[1] !== 100) params.append('maxPrice', priceRange[1].toString());

      const response = await fetch(`${API_BASE_URL}/beats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch beats');

      const data = await response.json();
      
      if (data.success) {
        const newBeats = data.data || [];
        setBeats(prev => reset ? newBeats : [...prev, ...newBeats]);
        setCurrentPage(page);
        setTotalPages(data.pagination?.pages || 1);
        setHasMore(page < (data.pagination?.pages || 1));
      } else {
        throw new Error(data.error?.message || 'Failed to fetch beats');
      }
    } catch (error) {
      console.error('Error fetching beats:', error);
      toast({
        title: "Error",
        description: "Failed to load beats. Please try again.",
        variant: "destructive"
      });
    }
  }, [searchQuery, selectedGenre, selectedMood, selectedKey, bpmRange, priceRange, sortBy, toast]);

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

  // Load initial data
  useEffect(() => {
    setIsLoading(true);
    fetchBeats(1, true).finally(() => setIsLoading(false));
  }, [fetchBeats]);

  // Reset to first page when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchBeats(1, true);
    }
  }, [searchQuery, selectedGenre, selectedMood, selectedKey, bpmRange, priceRange, sortBy]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchBeats(currentPage + 1, false);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, currentPage, fetchBeats]);

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
      id: beat._id || beat.id,
      title: beat.title,
      producer: beat.producer,
      artwork: beat.artwork,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      price: beat.salePrice || beat.basePrice,
      isLiked: false, // TODO: Implement like functionality
      hlsUrl: beat.hlsUrl,
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
            {isLoading ? 'Loading...' : `${beats.length} beats found`}
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading beats...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Beats Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {beats.map((beat, index) => (
                  <div
                    key={beat._id || beat.id}
                    className="anim-new-beat-pop"
                    style={{ animationDelay: `${(index % 20) * 40}ms` }}
                  >
                    <BeatCard
                      id={beat._id || beat.id}
                      title={beat.title}
                      producer={beat.producer}
                      artwork={beat.artwork}
                      bpm={beat.bpm}
                      musicalKey={beat.key}
                      genre={beat.genre}
                      price={beat.salePrice || beat.basePrice}
                      exclusive={beat.isExclusive}
                      onPlay={() => handlePlay(beat)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {beats.map((beat, index) => (
                  <div
                    key={beat._id || beat.id}
                    className="anim-new-beat-pop"
                    style={{ animationDelay: `${(index % 20) * 40}ms` }}
                  >
                    <BeatListItem
                      id={beat._id || beat.id}
                      title={beat.title}
                      producer={beat.producer}
                      artwork={beat.artwork}
                      bpm={beat.bpm}
                      musicalKey={beat.key}
                      genre={beat.genre}
                      price={beat.salePrice || beat.basePrice}
                      exclusive={beat.isExclusive}
                      onPlay={() => handlePlay(beat)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-6 w-full" />

        {isLoadingMore && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground animate-pulse">{t('browse.loadingMore')}</div>
        )}
        {!hasMore && (
          <div className="text-center py-8 text-muted-foreground text-sm">{t('browse.endOfList')}</div>
        )}

        {!isLoading && beats.length === 0 && (
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
