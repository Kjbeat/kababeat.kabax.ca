import { Globe, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface SocialsData {
  website?: string;
  instagram?: string;
  twitter?: string;
}

interface ProfileSocialsProps {
  socials: SocialsData;
}

export function ProfileSocials({ socials }: ProfileSocialsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center md:justify-end gap-2 mb-6 md:mb-0">
      {socials.website && (
        <Button variant="outline" size="icon" title={t('creator.visitWebsite')} aria-label={t('creator.visitWebsite')}>
          <Globe className="h-4 w-4" />
        </Button>
      )}
      {socials.instagram && (
        <Button variant="outline" size="icon" title={t('creator.instagramProfile')} aria-label={t('creator.instagramProfile')}>
          <Instagram className="h-4 w-4" />
        </Button>
      )}
      {socials.twitter && (
        <Button variant="outline" size="icon" title={t('creator.twitterProfile')} aria-label={t('creator.twitterProfile')}>
          <Twitter className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
