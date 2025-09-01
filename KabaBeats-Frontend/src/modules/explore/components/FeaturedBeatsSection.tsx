import { BeatCard } from "@/components/BeatCard";
import { Button } from "@/components/ui/button";
import { BeatGrid } from "@/components/beat-card";
import { useLanguage } from "@/contexts/LanguageContext";

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

interface FeaturedBeatsSectionProps {
  beats: Beat[];
  onPlayBeat: (beat: Beat) => void;
}

export function FeaturedBeatsSection({ beats, onPlayBeat }: FeaturedBeatsSectionProps) {
  const { t } = useLanguage();
  
  return (
    <section className="px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">{t('explore.trendingBeats')}</h2>
          {/* <Button variant="outline">{t('explore.viewAll')}</Button> */}
        </div>
  {/* Slightly reduced card width from previous 280 to 260 */}
  <BeatGrid className="mt-2" minColWidth={260}>
          {beats.slice(0, 4).map((beat, index) => {
            // Guard against accidental non-unique ids by composing with index + title
            const stableKey = beat.id || `${beat.title}-${index}`;
            return (
              <BeatCard
                key={stableKey}
                {...beat}
                onPlay={() => onPlayBeat(beat)}
              />
            );
          })}
        </BeatGrid>
      </div>
    </section>
  );
}
