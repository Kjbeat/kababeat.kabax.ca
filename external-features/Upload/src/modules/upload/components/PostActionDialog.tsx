import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface PostActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lastAction: "published" | "drafted" | "scheduled" | null;
  onUploadAnother: () => void;
  onGoToMyBeats: () => void;
}

export function PostActionDialog({ 
  isOpen, 
  onClose, 
  lastAction, 
  onUploadAnother, 
  onGoToMyBeats 
}: PostActionDialogProps) {
  const { t } = useLanguage();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('upload.postAction.success')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('upload.postAction.beatActioned').replace('{action}', lastAction || '')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onGoToMyBeats}>
            {t('upload.postAction.goToMyBeats')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onUploadAnother}>
            {t('upload.postAction.uploadAnother')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
