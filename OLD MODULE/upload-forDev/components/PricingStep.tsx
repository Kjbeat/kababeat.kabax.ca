/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PricingStepProps {
  formData: {
    basicPrice: string;
    premiumPrice: string;
    exclusivePrice: string;
    basicRights: {
      mp3Download: boolean;
      personalUse: boolean;
      streamingRights: boolean;
      untagged: boolean;
    };
    premiumRights: {
      mp3Download: boolean;
      wavDownload: boolean;
      personalUse: boolean;
      commercialUse: boolean;
      streamingRights: boolean;
      untagged: boolean;
    };
    exclusiveRights: {
      mp3Download: boolean;
      wavDownload: boolean;
      stemsIncluded: boolean;
      personalUse: boolean;
      commercialUse: boolean;
      streamingRights: boolean;
      syncRights: boolean;
      untagged: boolean;
      exclusive: boolean;
    };
  };
  onFormDataChange: (field: string, value: any) => void;
}

export function PricingStep({ formData, onFormDataChange }: PricingStepProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('upload.pricing.title')}</h2>
        <p className="text-muted-foreground">{t('upload.pricing.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic License */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('upload.pricing.basicLicense')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="basic-price">{t('upload.pricing.price')}</Label>
              <Input
                id="basic-price"
                type="number"
                value={formData.basicPrice}
                onChange={(e) => onFormDataChange("basicPrice", e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">{t('upload.pricing.includes')}</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.mp3Download')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.personalUse')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox disabled />
                  <Label className="text-sm">{t('upload.pricing.streamingRights')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox disabled />
                  <Label className="text-sm">{t('upload.pricing.untaggedVersion')}</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium License */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {t('upload.pricing.premiumLicense')}
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">{t('upload.pricing.popular')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="premium-price">{t('upload.pricing.price')}</Label>
              <Input
                id="premium-price"
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => onFormDataChange("premiumPrice", e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">{t('upload.pricing.includes')}</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.mp3WavDownload')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.commercialUse')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.streamingRights')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.untaggedVersion')}</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exclusive License */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('upload.pricing.exclusiveLicense')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="exclusive-price">{t('upload.pricing.price')}</Label>
              <Input
                id="exclusive-price"
                type="number"
                value={formData.exclusivePrice}
                onChange={(e) => onFormDataChange("exclusivePrice", e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">{t('upload.pricing.includes')}</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.fullMasterRights')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.allFileFormats')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.beatRemovedFromStore')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked disabled />
                  <Label className="text-sm">{t('upload.pricing.commercialSyncRights')}</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
