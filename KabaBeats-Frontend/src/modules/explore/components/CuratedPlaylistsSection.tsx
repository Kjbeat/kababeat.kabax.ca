import { PlaylistCard } from "@/components/PlaylistCard";
import { Button } from "@/components/ui/button";
import { BeatGrid } from "@/components/beat-card"; // retained in case we revert
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface Playlist {
  id: string;
  title: string;
  description: string;
  artwork: string;
  beatCount: number;
  curator: string;
  genre: string;
}

interface CuratedPlaylistsSectionProps {
  playlists: Playlist[];
}

export function CuratedPlaylistsSection({ playlists }: CuratedPlaylistsSectionProps) {
  const items = playlists.slice(0, 5);
  // Triple the list for ultra-smooth seamless loop effect
  const renderList = [...items, ...items, ...items];
  const navigate = useNavigate();
  const { t } = useLanguage();
  const goToPlaylist = (id: string) => navigate(`/playlists/${id}`);

  return (
    <section className="px-0">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-6 flex flex-col items-center gap-2">
          <h2 className="text-3xl font-bold text-foreground">{t('explore.curatedByKababeats')}</h2>
        </div>
        <div className="relative overflow-hidden w-full">
          <div
            className="animate-scroll-left flex flex-row group no-scrollbar gap-10 py-4 px-2 w-fit"
          >
            {renderList.map((p, i) => (
              <div
                key={p.id + '-' + i}
                className="flex-none flex justify-center min-w-[12rem]"
              >
                <button
                  type="button"
                  onClick={() => goToPlaylist(p.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToPlaylist(p.id); } }}
                  className="group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full cursor-pointer"
                  aria-label={`${t('explore.openPlaylist')} ${p.title}`}
                >
                  <PlaylistCard {...p} variant="circle" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
