import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProcess: (config: AIUploadConfig) => void;
  isProcessing: boolean;
  processingSteps: string[];
  currentProcessingStep: number;
}

export interface AIUploadConfig {
  audioFile: File | null;
  artworkFile: File | null;
  autoTitle: boolean;
  title: string;
  autoArtwork: boolean;
}

export function AIUploadDialog({ 
  isOpen, 
  onClose, 
  onProcess, 
  isProcessing, 
  processingSteps, 
  currentProcessingStep 
}: AIUploadDialogProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<AIUploadConfig>({
    audioFile: null,
    artworkFile: null,
    autoTitle: true,
    title: "",
    autoArtwork: true,
  });

  const handleFileChange = (type: 'audio' | 'artwork') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setConfig(prev => ({
      ...prev,
      [type === 'audio' ? 'audioFile' : 'artworkFile']: file
    }));
  };

  const handleProcess = () => {
    onProcess(config);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setConfig({
        audioFile: null,
        artworkFile: null,
        autoTitle: true,
        title: "",
        autoArtwork: true,
      });
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('upload.ai.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('upload.ai.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isProcessing ? (
          <div className="space-y-6">
            <div>
              <Label>{t('upload.ai.audioFile')}</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input type="file" accept=".mp3,.wav" onChange={handleFileChange('audio')} />
                {config.audioFile && (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {config.audioFile.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">{t('upload.ai.letAiGenerateTitle')}</Label>
                <p className="text-xs text-muted-foreground">{t('upload.ai.titleGenerated')}</p>
              </div>
              <Switch 
                checked={config.autoTitle} 
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoTitle: checked }))} 
              />
            </div>

            {!config.autoTitle && (
              <div>
                <Label htmlFor="ai-title">{t('upload.ai.titleLabel')}</Label>
                <Input 
                  id="ai-title" 
                  placeholder={t('upload.ai.enterBeatTitle')} 
                  value={config.title} 
                  onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))} 
                  className="mt-2" 
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">{t('upload.ai.letAiGenerateArtwork')}</Label>
                <p className="text-xs text-muted-foreground">{t('upload.ai.artworkGenerated')}</p>
              </div>
              <Switch 
                checked={config.autoArtwork} 
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoArtwork: checked }))} 
              />
            </div>

            {!config.autoArtwork && (
              <div>
                <Label>{t('upload.ai.artwork')}</Label>
                <Input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange('artwork')} className="mt-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">{t('upload.ai.processingBeat')}</span>
            </div>
            <ul className="space-y-2">
              {processingSteps.map((label, idx) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  {idx < currentProcessingStep ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : idx === currentProcessingStep ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 inline-block" />
                  )}
                  <span className={idx <= currentProcessingStep ? "text-foreground" : "text-muted-foreground"}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>{t('upload.ai.close')}</AlertDialogCancel>
          {!isProcessing && (
            <Button onClick={handleProcess} disabled={!config.audioFile}>
              <Sparkles className="h-4 w-4 mr-2" />
              {t('upload.ai.process')}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
