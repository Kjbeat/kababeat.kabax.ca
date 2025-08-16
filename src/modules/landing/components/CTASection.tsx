import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function CTASection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative py-24 bg-gradient-to-br from-background via-background to-background text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
      <div className="relative max-w-5xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          {t('cta.title')}
        </h2>
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-muted-foreground">
          {t('cta.subtitle')}
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg text-lg px-10 py-5 rounded-full"
            onClick={() => navigate('/signup')}
          >
            {t('cta.button')}
          </Button>
        </div>
      </div>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Kababeats. {t('cta.footer')}</p>
        <div className="flex justify-center gap-6 mt-2">
          <a href="/terms" className="hover:text-primary underline-offset-4 hover:underline">
            {t('cta.terms')}
          </a>
          <a href="/privacy" className="hover:text-primary underline-offset-4 hover:underline">
            {t('cta.privacy')}
          </a>
          <a href="/contact" className="hover:text-primary underline-offset-4 hover:underline">
            {t('cta.contact')}
          </a>
        </div>
      </footer>
    </section>
  );
}
