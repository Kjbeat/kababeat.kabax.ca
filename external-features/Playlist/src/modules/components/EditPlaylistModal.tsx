import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Playlist } from "../types";
import { useLanguage } from "@/contexts/LanguageContext";

interface EditPlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: Playlist | null;
  onEditPlaylist: (playlist: {
    title: string;
    description: string;
    coverImage: string;
    isPublic: boolean;
  }) => void;
}

export function EditPlaylistModal({
  isOpen,
  onOpenChange,
  playlist,
  onEditPlaylist
}: EditPlaylistModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
    coverImage: null as File | null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (playlist) {
      setFormData({
        title: playlist.title,
        description: playlist.description === t('playlist.noDescription') ? "" : playlist.description,
        visibility: playlist.isPublic ? "public" : "private",
        coverImage: null
      });
      setPreviewUrl(playlist.coverImage || null);
    }
  }, [playlist]);

  // Focus handling
  useEffect(() => {
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => () => { if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    const trimmed = formData.title.trim();
    if (!trimmed) {
      toast({ title: t('playlist.titleRequired'), description: t('playlist.enterTitle'), variant: "destructive" });
      return;
    }
    if (trimmed.length > 80) {
      toast({ title: t('playlist.titleTooLong'), description: t('playlist.titleMaxLength'), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onEditPlaylist({
        title: trimmed,
        description: formData.description.trim() || t('playlist.noDescription'),
        coverImage: previewUrl || "/placeholder.svg",
        isPublic: formData.visibility === "public"
      });
      setSubmitting(false);
      onOpenChange(false);
    }, 75);
  };

  const handleCancel = () => {
    if (playlist) {
      setFormData({
        title: playlist.title,
        description: playlist.description === t('playlist.noDescription') ? "" : playlist.description,
        visibility: playlist.isPublic ? "public" : "private",
        coverImage: null
      });
      setPreviewUrl(playlist.coverImage || null);
    }
    onOpenChange(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t('playlist.unsupportedFile'), description: t('playlist.selectImageFile'), variant: "destructive" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: t('playlist.imageTooLarge'), description: t('playlist.maxSize3mb'), variant: "destructive" });
      return;
    }
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData(prev => ({ ...prev, coverImage: file }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('playlist.editTitle')}</DialogTitle>
          <DialogDescription>
            {t('playlist.editDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('playlist.editFormAria')}>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-title">{t('playlist.titleLabel')} <span className="text-destructive">*</span></Label>
            <Input
              id="edit-title"
              ref={titleInputRef}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('playlist.titlePlaceholder')}
              maxLength={120}
              aria-required="true"
              aria-invalid={!formData.title.trim() ? 'true' : 'false'}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            />
            <p className="text-xs text-muted-foreground">{formData.title.length}/120</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-description">{t('playlist.descriptionLabel')}</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('playlist.descriptionPlaceholder')}
              rows={3}
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground">{formData.description.length}/400</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-cover-image">{t('playlist.coverImageLabel')}</Label>
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-md bg-muted overflow-hidden flex items-center justify-center ring-1 ring-border">
                {previewUrl ? (
                  <img src={previewUrl} alt={t('playlist.coverPreviewAlt')} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground text-center px-1">{t('playlist.noImage')}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  id="edit-cover-image"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={onFileChange}
                />
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setFormData(prev => ({ ...prev, coverImage: null }));
                    }}
                  >
                    {t('playlist.removeImage')}
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground">{t('playlist.imageHint')}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-visibility">{t('playlist.visibilityLabel')}</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
            >
              <SelectTrigger id="edit-visibility" aria-label={t('playlist.visibilityAria')}>
                <SelectValue placeholder={t('playlist.visibilityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{t('playlist.public')}</SelectItem>
                <SelectItem value="private">{t('playlist.private')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
              {t('playlist.cancel')}
            </Button>
            <Button type="submit" disabled={!formData.title.trim() || submitting}>
              {submitting ? t('playlist.saving') : t('playlist.saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
