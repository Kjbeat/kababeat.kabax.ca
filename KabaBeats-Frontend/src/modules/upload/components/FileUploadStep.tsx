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
    <div className="space-y-8">
      {/* Header Section */}
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
            "text-white shadow-md hover:shadow-lg transition-all duration-300 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-background",
            "active:scale-[0.97] hover:scale-[1.02]"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('upload.fileUpload.aiUpload')}</span>
          <span className="text-[10px] uppercase tracking-wide ml-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 border border-white/25">{t('upload.fileUpload.beta')}</span>
        </Button>
      </div>

      <Separator />

      {/* Side-by-Side Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Upload Card - Left Side */}
        <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FileAudio className="relative h-5 w-5 text-primary" />
                </div>
                {t('upload.fileUpload.audioFile')}
              </CardTitle>
              {infoChip}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-6 transition-all text-center group/upload",
                "bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20",
                audioDrag ? "border-primary/70 bg-primary/10 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
              )}
              {...dragEvents('audio')}
            >
              {formData.audioFile ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30 blur-sm animate-pulse" />
                      <Check className="relative h-8 w-8 text-green-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600 truncate max-w-[200px]" title={formData.audioFile.name}>
                        {formData.audioFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                 
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRemoveFile('audio')}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-1" /> {t('upload.fileUpload.remove')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-blue-400/30 via-purple-400/20 to-pink-400/20 blur-sm opacity-60 animate-pulse" />
                      <Upload className="relative h-12 w-12 text-muted-foreground group-hover/upload:text-primary transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium group-hover/upload:text-primary transition-colors duration-300">
                        {t('upload.fileUpload.dropBeatHere')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t('upload.fileUpload.formatInfo')}</p>
                    </div>
                  </div>
                  {audioError && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                      {audioError}
                    </p>
                  )}
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
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                      >
                        <span>{t('upload.fileUpload.selectAudio')}</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/10" />
            </div>
          </CardContent>
        </Card>

        {/* Stems Upload Card - Right Side */}
        <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Archive className="relative h-5 w-5 text-primary" />
                </div>
                Stems (Optional)
              </CardTitle>
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[11px] font-medium">
                <Info className="h-3 w-3" /> Premium+
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-6 transition-all text-center group/upload",
                "bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20",
                stemsDrag ? "border-primary/70 bg-primary/10 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
              )}
              {...dragEvents('stems')}
            >
              {formData.stemsFile ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30 blur-sm animate-pulse" />
                      <Check className="relative h-8 w-8 text-green-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600 truncate max-w-[200px]" title={formData.stemsFile.name}>
                        {formData.stemsFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{(formData.stemsFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                    <Check className="h-3 w-3" />
                    Stems ready for upload
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRemoveFile('stems')}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-400/30 via-orange-400/20 to-red-400/20 blur-sm opacity-60 animate-pulse" />
                      <Archive className="relative h-12 w-12 text-muted-foreground group-hover/upload:text-primary transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium group-hover/upload:text-primary transition-colors duration-300">
                        Drop stems ZIP file here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">ZIP file containing individual track stems (max 500MB)</p>
                    </div>
                  </div>
                  {stemsError && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                      {stemsError}
                    </p>
                  )}
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
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                        onClick={() => document.getElementById('stems-upload')?.click()}
                      >
                        <span>Select Stems ZIP</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-amber-500/5 via-transparent to-orange-500/10" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
