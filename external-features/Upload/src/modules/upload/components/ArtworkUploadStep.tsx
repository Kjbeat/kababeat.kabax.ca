import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeatFormData } from "../types";
import { ImageIcon, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArtworkUploadStepProps {
  formData: BeatFormData;
  onFormDataChange: (field: keyof BeatFormData, value: unknown) => void;
}

const ACCEPTED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const MAX_ART_SIZE_MB = 10;

export function ArtworkUploadStep({ formData, onFormDataChange }: ArtworkUploadStepProps) {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const artworkFile = formData.artwork as File | null | undefined;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (artworkFile) {
      const url = URL.createObjectURL(artworkFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [artworkFile]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ACCEPTED_IMAGE.includes(file.type)) {
      setError(t('upload.artwork.unsupportedImageType'));
      return;
    }
    if (file.size > MAX_ART_SIZE_MB * 1024 * 1024) {
      setError(t('upload.artwork.imageTooLarge').replace('{maxSize}', MAX_ART_SIZE_MB.toString()));
      return;
    }
    setError(null);
  onFormDataChange("artwork", file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const clearArtwork = () => {
  onFormDataChange("artwork", null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1">{t('upload.artwork.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('upload.artwork.description')}</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('upload.artwork.coverImage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition h-72 ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
          >
            {previewUrl ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-3">
                <img src={previewUrl} alt="Artwork preview" className="object-cover w-full h-full rounded-lg" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button type="button" size="sm" variant="destructive" onClick={clearArtwork}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">{t('upload.artwork.dragDropImage')}</p>
                <p className="text-xs text-muted-foreground mb-3">{t('upload.artwork.formatInfo').replace('{maxSize}', MAX_ART_SIZE_MB.toString())}</p>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  id="artwork-input"
                />
                <label htmlFor="artwork-input">
                  <span className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90">
                    {t('upload.artwork.browseFiles')}
                  </span>
                </label>
              </>
            )}
            {error && <p className="absolute bottom-3 text-xs text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
