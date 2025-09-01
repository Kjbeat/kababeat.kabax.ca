import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Duplicate import removed
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Camera } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProfileSettings() {
  const { t } = useLanguage();
  
  const [profileData, setProfileData] = useState({
    username: "johndoe",
    displayName: "John Doe",
    email: "john@example.com",
    bio: "Hip-hop producer and beat maker from Los Angeles. Creating fire beats since 2018.",
    website: "https://johndoebeats.com",
    instagram: "@johndoebeats",
    twitter: "@johndoebeats",
    youtube: "johndoebeats",
  });

  // Modal state
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Record<string, number> | null>(null);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  });

  // Crop complete
  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, [setCroppedAreaPixels]);

  // Save cropped image (stub)
  const handleSave = () => {
    // TODO: Implement actual cropping and upload logic
    setOpen(false);
  };

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          {t('profile.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Camera className="h-4 w-4 mr-2" />
              {t('profile.changePhoto')}
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              {t('profile.photoDescription')}
            </p>
          </div>
        </div>

        <Separator />

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('profile.username')}</Label>
            <Input
              id="username"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">{t('profile.displayName')}</Label>
            <Input
              id="display-name"
              value={profileData.displayName}
              onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('profile.emailAddress')}</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t('profile.bio')}</Label>
          <Textarea
            id="bio"
            rows={3}
            maxLength={160}
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          />
          <div className="text-xs text-muted-foreground text-right">
            {profileData.bio.length}/160 {t('profile.characters')}
          </div>
        </div>

        <Separator />

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('profile.socialLinks')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">{t('profile.website')}</Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">{t('profile.instagram')}</Label>
              <Input
                id="instagram"
                value={profileData.instagram}
                onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">{t('profile.twitter')}</Label>
              <Input
                id="twitter"
                value={profileData.twitter}
                onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">{t('profile.youtube')}</Label>
              <Input
                id="youtube"
                value={profileData.youtube}
                onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
              />
            </div>
          </div>
        </div>
      </CardContent>
      </Card>

      {/* Modal for changing photo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('profile.changeProfilePhoto')}</DialogTitle>
          </DialogHeader>
          {!imageSrc ? (
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-muted/40">
              <input {...getInputProps()} />
              <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-sm">{t('profile.dragDropImage')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.photoDescription')}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="w-full flex items-center gap-2">
                <span className="text-xs">{t('profile.zoom')}</span>
                <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={([z]) => setZoom(z)} className="flex-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImageSrc(null); setOpen(false); }}>{t('profile.cancel')}</Button>
            <Button disabled={!imageSrc} onClick={handleSave}>{t('profile.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
