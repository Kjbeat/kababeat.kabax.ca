import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BeatFormData } from "../types";
import { ImageIcon, Trash2, Crop, Upload, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../../utils/imageUtils";

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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (artworkFile) {
      const url = URL.createObjectURL(artworkFile);
      setPreviewUrl(url);
      setOriginalImageUrl(url);
      // Don't automatically open modal - let user decide when to crop
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
      setOriginalImageUrl(null);
      setCroppedImage(null);
      setShowCropModal(false);
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
    setCroppedImage(null);
    setOriginalImageUrl(null);
    setShowCropModal(false);
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);



  const applyCrop = async () => {
    if (croppedAreaPixels && originalImageUrl) {
      try {
        const croppedImageUrl = await getCroppedImg(
          originalImageUrl,
          croppedAreaPixels,
          0
        );
        
        // Convert cropped image to File
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], artworkFile?.name || 'artwork.jpg', {
          type: 'image/jpeg',
        });
        
        setCroppedImage(croppedImageUrl);
        setShowCropModal(false);
        onFormDataChange("artwork", file);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('upload.artwork.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('upload.artwork.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ImageIcon className="h-5 w-5 text-primary" />
              {t('upload.artwork.coverImage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 transition-all text-center group",
                "bg-gradient-to-br from-muted/40 to-muted/10",
                dragActive ? "border-primary/70 bg-primary/10 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {!previewUrl ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-primary/30 via-fuchsia-400/20 to-amber-300/20 blur-sm opacity-60 animate-pulse" />
                      <ImageIcon className="relative h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors duration-300">
                        {t('upload.artwork.dragDropImage')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('upload.artwork.formatInfo').replace('{maxSize}', MAX_ART_SIZE_MB.toString())}
                      </p>
                    </div>
                  </div>
                  {error && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-center">
                    <Input
                      type="file"
                      accept={ACCEPTED_IMAGE.join(",")}
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                      id="artwork-input"
                    />
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                      onClick={() => document.getElementById('artwork-input')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('upload.artwork.browseFiles')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30 blur-sm animate-pulse" />
                      <Check className="relative h-8 w-8 text-green-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">
                        Image uploaded successfully
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {croppedImage ? "Artwork ready!" : "Ready for cropping"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    {!croppedImage && (
                      <Button 
                        onClick={() => setShowCropModal(true)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary/90 hover:to-fuchsia-500/90"
                      >
                        <Crop className="h-4 w-4 mr-1" />
                        Crop Image
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearArtwork}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-primary/5 via-transparent to-fuchsia-500/10" />
            </div>
          </CardContent>
        </Card>

        {/* Beat Card Preview */}
        <Card className="border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-fuchsia-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Check className="relative h-5 w-5 text-primary" />
              </div>
              Beat Card Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Beat Card */}
              <div className="relative bg-gradient-to-br from-background to-muted rounded-xl p-4 shadow-lg border border-border/50">
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted mb-3">
                  {croppedImage ? (
                    <img 
                      src={croppedImage} 
                      alt="Beat artwork" 
                      className="w-full h-full object-cover"
                    />
                  ) : previewUrl ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-fuchsia-500/20">
                      <div className="text-center">
                        <Crop className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Crop your image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No artwork</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {formData.title || "Your Beat Title"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Producer Name
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formData.bpm || "140"} BPM</span>
                    <span>{formData.key || "C"}</span>
                    <span>{formData.genre || "Hip Hop"}</span>
                  </div>
                </div>
              </div>

              {croppedImage && (
                <div className="text-center space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">Artwork ready!</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your cropped artwork will appear on your beat card
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCropModal(true)}
                    className="w-full"
                  >
                    <Crop className="h-4 w-4 mr-2" />
                    Re-crop Image
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5 text-primary" />
              Crop Your Artwork
            </DialogTitle>
          </DialogHeader>
          
          {originalImageUrl && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adjust the crop area to fit your beat card perfectly
              </p>
              
              <div className="relative h-96 bg-black rounded-lg overflow-hidden">
                <Cropper
                  image={originalImageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                  style={{
                    containerStyle: {
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    },
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Zoom:</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCropModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={applyCrop}
              className="bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary/90 hover:to-fuchsia-500/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
