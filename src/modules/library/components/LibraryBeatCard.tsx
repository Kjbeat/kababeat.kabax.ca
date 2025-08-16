import { Download, FileText, Play, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { BeatCard as BaseBeatCard } from "@/components/beat-card/BeatCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LibraryBeat {
  id: number;
  title: string;
  producer: string;
  artwork: string;
  price: number;
  genre: string;
  purchaseDate: string;
  licenseType: string;
  bpm: number;
  key: string;
}

interface LibraryBeatCardProps {
  beat: LibraryBeat;
  viewMode: "grid" | "list";
}

export function LibraryBeatCard({ beat, viewMode }: LibraryBeatCardProps) {
  const { playBeat, pauseBeat, resumeBeat, state: playerState } = useMediaPlayer();
  const { t } = useLanguage();

  const isCurrent = playerState.currentBeat?.id === beat.id.toString();
  const isPlaying = isCurrent && playerState.isPlaying;

  const handlePlayBeat = () => {
    if (isCurrent) {
      if (isPlaying) {
        pauseBeat();
      } else {
        resumeBeat();
      }
      return;
    }
    playBeat({
      id: beat.id.toString(),
      title: beat.title,
      producer: beat.producer,
      artwork: beat.artwork,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      price: 0,
    });
  };

  const handleDownloadBeat = () => {
    // TODO: replace with real download endpoint
    const url = `/api/beats/${beat.id}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${beat.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadLicense = () => {
    // License document download
    const url = `/api/beats/${beat.id}/license?type=${encodeURIComponent(beat.licenseType)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${beat.title}-license.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (viewMode === 'grid') {
    // Reuse existing BeatCard visuals but override pricing/actions for purchased context.
    return (
      <div className="relative group">
        <BaseBeatCard
          id={beat.id.toString()}
          title={beat.title}
          producer={beat.producer}
          artwork={beat.artwork}
          bpm={beat.bpm}
          musicalKey={beat.key}
          genre={beat.genre}
          price={0}
          hidePrice
          onPlay={handlePlayBeat}
        />
        {/* Purchase metadata & download actions overlay at bottom */}
        <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs px-1">
          <span className="text-muted-foreground">{t('library.purchased')} {new Date(beat.purchaseDate).toLocaleDateString()}</span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{beat.licenseType}</Badge>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadBeat} className="h-7 text-[11px] px-2">
            <Download className="h-3 w-3 mr-1" /> {t('library.beat')}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDownloadLicense} className="h-7 text-[11px] px-2">
            <FileText className="h-3 w-3 mr-1" /> {t('library.license')}
          </Button>
        </div>
      </div>
    );
  }

  // List view custom layout
  return (
    <Card className={cn("hover:shadow-md transition-shadow", "border-border/60")}> 
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={handlePlayBeat}
                className="relative group w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={isPlaying ? `${t('library.pause')} ${beat.title}` : `${t('library.play')} ${beat.title}`}
              >
                {beat.artwork ? (
                  <img src={beat.artwork} alt={beat.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary text-white text-xs font-medium">
                    {beat.title.slice(0,2).toUpperCase()}
                  </div>
                )}
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isPlaying ? '!opacity-100 bg-black/60' : ''}`}>
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </div>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate text-sm">{beat.title}</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{beat.licenseType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{beat.producer}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>{beat.genre}</span>
                  <span>{beat.bpm} {t('library.bpm')}</span>
                  <span>{beat.key}</span>
                  <span className="hidden sm:inline">{t('library.purchased')} {new Date(beat.purchaseDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <Button size="sm" variant="outline" onClick={handleDownloadBeat} className="h-8">
              <Download className="h-4 w-4 mr-1" /> {t('library.beat')}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDownloadLicense} className="h-8">
              <FileText className="h-4 w-4 mr-1" /> {t('library.license')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
