import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { ProfileSettings } from "./ProfileSettings";
import { BillingSettings } from "./BillingSettings";
import { NotificationSettings } from "./NotificationSettings";
import SubscriptionSettings from "./SubscriptionSettings";
import PayoutSettings from "./PayoutSettings";
import PrivacySettings from "./PrivacySettings";
import { useLanguage } from "@/contexts/LanguageContext";

export function DashboardSettingsLayout() {
  const { t } = useLanguage();
  
  return (
    <div className="px-4 py-4 sm:p-6 pb-20 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
        <Button className="w-full sm:w-auto text-sm">
          <Save className="h-4 w-4 mr-2" />
          {t('settings.saveAllChanges')}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="privacy">{t('settings.privacy')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 sm:space-y-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
