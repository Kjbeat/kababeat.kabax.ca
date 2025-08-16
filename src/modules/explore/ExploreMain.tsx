import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { 
  HeroSection,
  StatsSection,
  CuratedPlaylistsSection,
  FeaturedBeatsSection,
  InfiniteScrollBeatsSection,
  GenresSection
} from "./components";
import { curatedPlaylists, featuredBeats } from "./utils/mockData";
import { useInfiniteScrollBeats } from "./hooks/useInfiniteScrollBeats";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const { playBeat } = useMediaPlayer();
  const navigate = useNavigate();
  
  const { allBeats, isLoadingMore, hasMore, loadMoreBeats } = useInfiniteScrollBeats();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/landing');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to landing
  }

  return (
    <div className="pt-10 sm:pt-10 space-y-8 pb-32">
      <HeroSection />
      {/* <StatsSection /> */}
      <CuratedPlaylistsSection playlists={curatedPlaylists} />
      <FeaturedBeatsSection beats={featuredBeats} onPlayBeat={playBeat} />
      <InfiniteScrollBeatsSection 
        beats={allBeats}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onPlayBeat={playBeat}
        onLoadMore={loadMoreBeats}
      />
      {/* <GenresSection /> */}
    </div>
  );
};

export default Index;
