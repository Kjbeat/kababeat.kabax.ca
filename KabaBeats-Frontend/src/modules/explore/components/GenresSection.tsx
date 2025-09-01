import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const genres = [
  "Afrobeats", 
  "Amapiano", 
  "Afrotrap", 
  "Hiplife", 
  "Dancehall", 
  "Afrofusion", 
  "Kwaito", 
  "Azonto"
];

export function GenresSection() {
  const { t } = useLanguage();
  
  return (
    <section className="px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6">{t('explore.browseByGenre')}</h2>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
