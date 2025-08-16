import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Playlist } from "../types";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeletePlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: Playlist | null;
  onDeletePlaylist: () => void;
}

export function DeletePlaylistModal({
  isOpen,
  onOpenChange,
  playlist,
  onDeletePlaylist
}: DeletePlaylistModalProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('playlist.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('playlist.deleteConfirm').replace('{title}', playlist?.title || '')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('playlist.cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDeletePlaylist}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('playlist.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
