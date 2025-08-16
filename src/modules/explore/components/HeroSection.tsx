import { Button } from "@/components/ui/button";
import { Play, Music } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <section 
      className="relative h-[70vh] sm:h-80 md:h-96 bg-gradient-hero flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-6">
          {t('explore.discoverAmazing')}
          <span className="block bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            {t('explore.africanBeats')}
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
          {t('explore.heroDescription')}
        </p>
        <div className="flex gap-3 sm:gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-sm sm:text-base py-2 px-4">
            <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {t('explore.startExploring')}
          </Button>
          {/* <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
            <Music className="h-5 w-5 mr-2" />
            {t('explore.uploadBeats')}
          </Button> */}
        </div>
      </div>
    </section>
  );
}
