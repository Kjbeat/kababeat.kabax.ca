import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section 
      className="relative h-screen bg-gradient-hero flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
      
      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle variant="icon-only" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/30">
          {t('landing.hero.badge')}
        </Badge>
        
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8">
          <span className="block">{t('landing.hero.title')}</span>
          <span className="block text-4xl md:text-5xl bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent mt-4">
            {t('landing.hero.subtitle')}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
          {t('landing.hero.description')}
          <span className="block mt-2 font-semibold">{t('landing.hero.features')}</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-lg px-8 py-4 h-auto"
            onClick={() => navigate('/signup')}
          >
            <Play className="h-6 w-6 mr-3" />
            {t('landing.hero.startCreating')}
          </Button>
            <Button 
            size="lg" 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4 h-auto"
            onClick={() => navigate('/login')}
            >
            <Music className="h-6 w-6 mr-3" />
            {t('landing.hero.signIn')}
            </Button>
        </div>
      </div>
    </section>
  );
}
