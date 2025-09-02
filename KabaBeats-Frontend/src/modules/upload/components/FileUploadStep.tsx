import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FileAudio, Upload, Check, X, Sparkles, Info, Music2, Archive } from "lucide-react";
import { BeatFormData } from "../types";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploadStepProps {
  formData: BeatFormData;
  onFileUpload: (type: 'audio' | 'artwork' | 'stems') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (type: 'audio' | 'artwork' | 'stems') => () => void;
  onAiUpload: () => void;
}

const MAX_AUDIO_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_STEMS_SIZE = 500 * 1024 * 1024; // 500MB for stems

export function FileUploadStep({ formData, onFileUpload, onRemoveFile, onAiUpload }: FileUploadStepProps) {
  const { t } = useLanguage();
  const [audioDrag, setAudioDrag] = useState(false);
  const [stemsDrag, setStemsDrag] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [stemsError, setStemsError] = useState<string | null>(null);
  // Removed fake analysis progress animation

  const triggerSynthetic = useCallback((type: 'audio' | 'artwork' | 'stems', file: File) => {
    const syntheticEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    onFileUpload(type)(syntheticEvent);
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'audio' | 'artwork' | 'stems') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'audio') {
      setAudioDrag(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!/(mp3|wav)$/i.test(file.name)) { setAudioError(t('upload.fileUpload.unsupportedFormat')); return; }
      if (file.size > MAX_AUDIO_SIZE) { setAudioError(t('upload.fileUpload.fileTooLarge')); return; }
      setAudioError(null);
      triggerSynthetic(type, file);
    } else if (type === 'stems') {
      setStemsDrag(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!/\.zip$/i.test(file.name)) { setStemsError('Only ZIP files are allowed for stems'); return; }
      if (file.size > MAX_STEMS_SIZE) { setStemsError('Stems file is too large (max 500MB)'); return; }
      setStemsError(null);
      triggerSynthetic(type, file);
    }
  }, [triggerSynthetic, t]);

  const dragEvents = (type: 'audio' | 'artwork' | 'stems') => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (type === 'audio') setAudioDrag(true);
      if (type === 'stems') setStemsDrag(true);
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      if (type === 'audio') setAudioDrag(true);
      if (type === 'stems') setStemsDrag(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      if (type === 'audio') setAudioDrag(false);
      if (type === 'stems') setStemsDrag(false);
    },
    onDrop: (e: React.DragEvent) => handleDrop(e, type)
  });

  const infoChip = (
    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">
      <Info className="h-3 w-3" /> {t('upload.fileUpload.tips')}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" /> {t('upload.fileUpload.startUpload')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('upload.fileUpload.description')}</p>
        </div>
        <Button
          type="button"
          onClick={onAiUpload}
          aria-label="Open AI assisted upload"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg h-11 px-4 text-sm font-medium",
            "bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-400",
            "text-white shadow-md hover:shadow-lg transition-shadow focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-background",
            "active:scale-[0.97]"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('upload.fileUpload.aiUpload')}</span>
          <span className="text-[10px] uppercase tracking-wide ml-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 border border-white/25">{t('upload.fileUpload.beta')}</span>
        </Button>
      </div>

      <Separator />

      <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileAudio className="h-5 w-5 text-primary" />
              {t('upload.fileUpload.audioFile')}
            </CardTitle>
            {infoChip}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all text-center group",
              "bg-gradient-to-b from-muted/40 to-muted/10",
              audioDrag ? "border-primary/70 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
            )}
            {...dragEvents('audio')}
          >
            {formData.audioFile ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="h-5 w-5" />
                    <span className="font-medium truncate max-w-[260px]" title={formData.audioFile.name}>{formData.audioFile.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                  <Check className="h-3 w-3" />
                  {t('upload.fileUpload.readyToUpload')}
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={onRemoveFile('audio')}>
                    <X className="h-4 w-4 mr-1" /> {t('upload.fileUpload.remove')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary/30 via-fuchsia-400/20 to-amber-300/20 blur-sm opacity-40" />
                    <Upload className="relative h-14 w-14 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium">{t('upload.fileUpload.dropBeatHere')}</p>
                  <p className="text-xs text-muted-foreground">{t('upload.fileUpload.formatInfo')}</p>
                </div>
                {audioError && <p className="text-xs text-destructive">{audioError}</p>}
                <div className="flex justify-center">
                  <Input
                    id="audio-upload"
                    type="file"
                    accept=".mp3,.wav"
                    onChange={(e) => { setAudioError(null); onFileUpload('audio')(e); }}
                    className="hidden"
                  />
                  <Label htmlFor="audio-upload" className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('audio-upload')?.click()}
                    >
                      <span>{t('upload.fileUpload.selectAudio')}</span>
                    </Button>
                  </Label>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-primary/5 via-transparent to-fuchsia-500/10" />
          </div>
        </CardContent>
      </Card>

      {/* Stems Upload Section */}
      <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Archive className="h-5 w-5 text-primary" />
              Stems (Optional)
            </CardTitle>
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[11px] font-medium">
              <Info className="h-3 w-3" /> For Premium, Unlimited & Exclusive licenses
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all text-center group",
              "bg-gradient-to-b from-muted/40 to-muted/10",
              stemsDrag ? "border-primary/70 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
            )}
            {...dragEvents('stems')}
          >
            {formData.stemsFile ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="h-5 w-5" />
                    <span className="font-medium truncate max-w-[260px]" title={formData.stemsFile.name}>{formData.stemsFile.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{(formData.stemsFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                  <Check className="h-3 w-3" />
                  Stems ready for upload
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={onRemoveFile('stems')}>
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-300/30 via-orange-400/20 to-red-300/20 blur-sm opacity-40" />
                    <Archive className="relative h-14 w-14 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium">Drop stems ZIP file here</p>
                  <p className="text-xs text-muted-foreground">ZIP file containing individual track stems (max 500MB)</p>
                </div>
                {stemsError && <p className="text-xs text-destructive">{stemsError}</p>}
                <div className="flex justify-center">
                  <Input
                    id="stems-upload"
                    type="file"
                    accept=".zip"
                    onChange={(e) => { setStemsError(null); onFileUpload('stems')(e); }}
                    className="hidden"
                  />
                  <Label htmlFor="stems-upload" className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="cursor-pointer"
                      onClick={() => document.getElementById('stems-upload')?.click()}
                    >
                      <span>Select Stems ZIP</span>
                    </Button>
                  </Label>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-amber-500/5 via-transparent to-orange-500/10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
