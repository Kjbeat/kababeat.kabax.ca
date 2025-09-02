import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Music } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { BeatFormData } from "../types";

interface ReviewStepProps {
  formData: BeatFormData;
  onPublish: () => void;
  onSaveDraft: () => void;
  onSchedule: () => void;
  termsAccepted: boolean;
  onTermsChange: (value: boolean) => void;
}

export function ReviewStep({ formData, onPublish, onSaveDraft, onSchedule, termsAccepted, onTermsChange }: ReviewStepProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('upload.review.title')}</h2>
        <p className="text-muted-foreground">{t('upload.review.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('upload.review.beatPreview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview Card */}
            <div className="bg-gradient-card rounded-lg p-6">
              <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                {formData.artwork ? (
                  <img 
                    src={URL.createObjectURL(formData.artwork)} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Music className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-bold text-lg">{formData.title || t('upload.review.untitled')}</h3>
              <p className="text-muted-foreground">{t('upload.review.byYourName')}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{formData.bpm || "---"} BPM</Badge>
                <Badge variant="secondary">{formData.key || "---"}</Badge>
                <Badge variant="outline">{formData.genre || "---"}</Badge>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t('upload.review.beatInformation')}</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>{t('upload.beatInfo.beatTitle')}:</strong> {formData.title || t('upload.review.notSet')}</div>
                  <div><strong>{t('upload.beatInfo.bpm')}:</strong> {formData.bpm || t('upload.review.notSet')}</div>
                  <div><strong>{t('upload.beatInfo.key')}:</strong> {formData.key || t('upload.review.notSet')}</div>
                  <div><strong>{t('upload.beatInfo.genre')}:</strong> {formData.genre || t('upload.review.notSet')}</div>
                  <div><strong>{t('upload.beatInfo.mood')}:</strong> {formData.mood || t('upload.review.notSet')}</div>
                  <div><strong>{t('upload.beatInfo.basePrice')}:</strong> ${formData.basePrice || 0}</div>
                  <div><strong>{t('upload.beatInfo.salePrice')}:</strong> ${formData.salePrice || formData.basePrice || 0}</div>
                  <div><strong>{t('upload.beatInfo.isExclusive')}:</strong> {formData.isExclusive ? "Yes" : "No"}</div>
                  <div><strong>{t('upload.beatInfo.allowFreeDownload')}:</strong> {formData.allowFreeDownload ? "Yes" : "No"}</div>
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">{t('upload.review.tags')}</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">{t('upload.review.collaboratorSplits')}</h4>
                {formData.collaborators.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('upload.review.noCollaborators')}</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {formData.collaborators.map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="flex-1 truncate">{c.name}{c.role ? <span className="text-muted-foreground"> • {c.role}</span> : null}</span>
                        <span className="font-medium">{c.percent}%</span>
                      </div>
                    ))}
                    <div className="pt-1 text-xs text-muted-foreground">{t('upload.review.total').replace('{total}', formData.collaborators.reduce((acc, c) => acc + c.percent, 0).toString())}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-2 mb-4">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => onTermsChange(!!v)} />
            <Label htmlFor="terms" className="text-sm leading-snug">
              {t('upload.review.termsAgreement')}
            </Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" size="lg" className="w-full" onClick={onSaveDraft}>
              {t('upload.review.saveAsDraft')}
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={onSchedule} disabled={!termsAccepted} title={!termsAccepted ? t('upload.review.acceptTermsToSchedule') : undefined}>
              {t('upload.review.schedule')}
            </Button>
            <Button className="w-full" size="lg" onClick={onPublish} disabled={!termsAccepted} title={!termsAccepted ? t('upload.review.acceptTermsToPublish') : undefined}>
              <Music className="h-5 w-5 mr-2" />
              {t('upload.review.publishBeat')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
