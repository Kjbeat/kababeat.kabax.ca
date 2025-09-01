import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

interface LanguageToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function LanguageToggle({ variant = 'default', className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        className={cn("h-8 w-8", className)}
        aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
      >
        <Languages className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex rounded-lg bg-muted/40 border border-border overflow-hidden", className)}>
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium transition-colors",
            language === "en" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/40"
          )}
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
        >
          <span>EN</span>
        </button>
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium transition-colors",
            language === "fr" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/40"
          )}
          onClick={() => setLanguage("fr")}
          aria-pressed={language === "fr"}
        >
          <span>FR</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={cn("gap-2", className)}
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? 'EN' : 'FR'}
    </Button>
  );
}
