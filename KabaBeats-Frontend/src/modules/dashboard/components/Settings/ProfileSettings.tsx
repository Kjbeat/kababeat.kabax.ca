/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
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
import { User, Camera, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCroppedImg } from "@/utils/imageUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function ProfileSettings() {
  const { t } = useLanguage();
  const { user, updateProfile, accessToken, refreshUserData } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    website: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Extract handles from full URLs
  const extractHandle = useCallback((url: string, platform: string) => {
    if (!url) return "";
    
    try {
      if (platform === 'website') {
        // Remove protocol and www
        return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      }
      if (platform === 'instagram') {
        // Handle various Instagram URL formats
        return url.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '');
      }
      if (platform === 'twitter') {
        // Handle both twitter.com and x.com
        return url.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '').replace(/\/$/, '');
      }
      if (platform === 'youtube') {
        // Handle various YouTube URL formats
        return url.replace(/^https?:\/\/(www\.)?youtube\.com\/(@|channel\/|c\/|user\/)/, '').replace(/\/$/, '');
      }
      return url;
    } catch (error) {
      console.error(`Error extracting handle for ${platform}:`, error);
      return url;
    }
  }, []);

  // Load profile data on component mount and when user data changes
  useEffect(() => {
    if (user) {
      const extractedData = {
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        website: extractHandle(user.socialLinks?.website || "", 'website'),
        instagram: extractHandle(user.socialLinks?.instagram || "", 'instagram'),
        twitter: extractHandle(user.socialLinks?.twitter || "", 'twitter'),
        youtube: extractHandle(user.socialLinks?.youtube || "", 'youtube'),
      };

      setProfileData(extractedData);
    }
  }, [user, extractHandle]);

  // Refresh user data when component mounts to ensure we have the latest information
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, []); // Only run on mount

  // Save profile data
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Construct full URLs for social links
      const socialLinks = {
        website: profileData.website ? (profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`) : '',
        instagram: profileData.instagram ? `https://instagram.com/${profileData.instagram}` : '',
        twitter: profileData.twitter ? `https://twitter.com/${profileData.twitter}` : '',
        youtube: profileData.youtube ? `https://youtube.com/@${profileData.youtube}` : '',
      };



      const updateData = {
        username: profileData.username,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        socialLinks,
      };

      await updateProfile(updateData);
      
      // Refresh user data to ensure we have the latest information
      await refreshUserData();
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Modal state
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{x: number, y: number, width: number, height: number} | null>(null);

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

  // Save cropped image
  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    
    try {
      // Get cropped image
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      
      // Convert to File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
      
      // Upload to backend
      await uploadProfilePicture(file);
      
      setOpen(false);
      setImageSrc(null);
      setCroppedAreaPixels(null);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File) => {
    if (!user) return;
    
    try {
      // Step 1: Get upload URL
      const uploadResponse = await fetch(`${API_BASE_URL}/media/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fileType: 'profile',
          originalName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error?.message || 'Failed to get upload URL');
      }

      // Step 2: Upload file to R2
      const uploadToR2Response = await fetch(uploadData.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadToR2Response.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // Step 3: Confirm upload
      const confirmResponse = await fetch(`${API_BASE_URL}/media/confirm-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          key: uploadData.data.key,
          fileType: 'profile',
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm upload');
      }

      const confirmData = await confirmResponse.json();
      if (!confirmData.success) {
        throw new Error(confirmData.error?.message || 'Failed to confirm upload');
      }

      // Step 4: Update user profile with new avatar URL
      const avatarUrl = `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${uploadData.data.key}`;
      
      // Update profile with avatar
      await updateProfile({ avatar: avatarUrl } as any);
      
      // Refresh user data to ensure we have the latest avatar URL
      await refreshUserData();
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
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
            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {profileData.firstName?.[0] || profileData.username?.[0] || 'U'}
            </AvatarFallback>
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
              placeholder="Enter username"
            />
            <p className="text-xs text-muted-foreground">3-30 characters, letters, numbers, and underscores only</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.emailAddress')}</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              placeholder="Enter email address"
            />
            <p className="text-xs text-muted-foreground">Must be a valid email address</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('profile.firstName')}</Label>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('profile.lastName')}</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
            />
          </div>
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
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  https://
                </span>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  placeholder="yourwebsite.com"
                  className="rounded-l-none"
                />
              </div>

            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">{t('profile.instagram')}</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  instagram.com/
                </span>
                <Input
                  id="instagram"
                  value={profileData.instagram}
                  onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                  placeholder="yourusername"
                  className="rounded-l-none"
                />
              </div>

            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">{t('profile.twitter')}</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  twitter.com/
                </span>
                <Input
                  id="twitter"
                  value={profileData.twitter}
                  onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                  placeholder="yourusername"
                  className="rounded-l-none"
                />
              </div>

            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">{t('profile.youtube')}</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  youtube.com/@
                </span>
                <Input
                  id="youtube"
                  value={profileData.youtube}
                  onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
                  placeholder="yourchannel"
                  className="rounded-l-none"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
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
