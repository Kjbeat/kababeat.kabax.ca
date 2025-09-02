/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tag, X } from "lucide-react";
import { useState } from "react";
import { BeatFormData } from "../types";
import { GENRES, MOODS, KEYS } from "../constants";
import { useLanguage } from "@/contexts/LanguageContext";

interface BeatInfoStepProps {
  formData: BeatFormData;
  onFormDataChange: (field: string, value: any) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function BeatInfoStep({ formData, onFormDataChange, onAddTag, onRemoveTag }: BeatInfoStepProps) {
  const { t } = useLanguage();
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 3) {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6 m">
      {/* <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Beat Information</h2>
        <p className="text-muted-foreground">Tell us about your beat</p>
      </div> */}

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">{t('upload.beatInfo.beatTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  onFormDataChange("title", e.target.value);
                }
              }}
              placeholder={t('upload.beatInfo.enterBeatTitle')}
              className="mt-2"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('upload.beatInfo.characters').replace('{current}', formData.title.length.toString()).replace('{max}', '60')}
            </p>
          </div>

          {/* BPM and Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bpm">{t('upload.beatInfo.bpm')}</Label>
              <Input
                id="bpm"
                type="number"
                value={formData.bpm}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value <= 900) {
                    onFormDataChange("bpm", e.target.value);
                  }
                }}
                placeholder="140"
                className="mt-2"
                min="1"
                max="900"
              />
            </div>
            <div>
              <Label htmlFor="key">{t('upload.beatInfo.key')}</Label>
              <Select value={formData.key} onValueChange={(value) => onFormDataChange("key", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('upload.beatInfo.selectKey')} />
                </SelectTrigger>
                <SelectContent>
                  {KEYS.map((key) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Genre and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">{t('upload.beatInfo.genre')}</Label>
              <Select value={formData.genre} onValueChange={(value) => onFormDataChange("genre", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('upload.beatInfo.selectGenre')} />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mood">{t('upload.beatInfo.mood')}</Label>
              <Select value={formData.mood} onValueChange={(value) => onFormDataChange("mood", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('upload.beatInfo.selectMood')} />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((mood) => (
                    <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t('upload.beatInfo.description')}</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  onFormDataChange("description", e.target.value);
                }
              }}
              placeholder={t('upload.beatInfo.describeBeat')}
              className="mt-2"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('upload.beatInfo.characters').replace('{current}', formData.description.length.toString()).replace('{max}', '500')}
            </p>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">{t('upload.beatInfo.tags')}</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={formData.tags.length >= 3 ? t('upload.beatInfo.maxTagsReached') : t('upload.beatInfo.addTag')}
                  className="flex-1"
                  disabled={formData.tags.length >= 3}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= 3 || !newTag.trim()}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Tag className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('upload.beatInfo.tagsCount').replace('{current}', formData.tags.length.toString())}
              </p>
            </div>
          </div>

          {/* Free Download Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="freeDownload" className="text-base font-medium">
                  {t('upload.beatInfo.allowFreeDownload')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('upload.beatInfo.freeDownloadDescription')}
                </p>
              </div>
              <Switch
                id="freeDownload"
                checked={formData.allowFreeDownload}
                onCheckedChange={(checked) => onFormDataChange("allowFreeDownload", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
