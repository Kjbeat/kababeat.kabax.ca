import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Playlist } from "../types";
import { useLanguage } from "@/contexts/LanguageContext";

interface SharePlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: Playlist | null;
}

export function SharePlaylistModal({
  isOpen,
  onOpenChange,
  playlist
}: SharePlaylistModalProps) {
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (playlist) {
      setShareLink(`${window.location.origin}/playlist/${playlist.id}`);
    }
  }, [playlist]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: t('playlist.copied'),
        description: t('playlist.linkCopied')
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: t('playlist.copyFailed'), description: t('playlist.copyManually'), variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('playlist.sharePlaylist')}</DialogTitle>
          <DialogDescription>
            {t('playlist.sharePlaylistDescription')}
          </DialogDescription>
        </DialogHeader>
        
        {playlist && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img 
                src={playlist.coverImage} 
                alt={playlist.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h4 className="font-semibold">{playlist.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {playlist.trackCount} {playlist.trackCount === 1 ? t('playlist.track') : t('playlist.tracks')}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="share-link">{t('playlist.shareLink')}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                  aria-describedby="share-link-help"
                />
                <Button type="button" size="sm" onClick={copyShareLink} aria-label={t('playlist.copyShareLink')}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p id="share-link-help" className="text-xs text-muted-foreground">{t('playlist.shareLinkHelp')}</p>
            </div>

            {/* <div className="space-y-1 pt-2">
              <Label htmlFor="embed-code">{t('playlist.embed')}</Label>
              <Textarea
                id="embed-code"
                readOnly
                className="font-mono text-xs h-24 resize-none"
                value={`<iframe src='${shareLink}?embed=1' width='100%' height='400' frameborder='0' loading='lazy'></iframe>`}
              />
              <p className="text-xs text-muted-foreground">{t('playlist.embedHelp')}</p>
            </div> */}
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('playlist.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
