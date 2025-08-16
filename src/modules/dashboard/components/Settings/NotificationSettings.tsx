import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function NotificationSettings() {
  const { t } = useLanguage();
  
  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailComments: false,
    emailFollowers: true,
    pushSales: true,
    pushComments: false,
    pushFollowers: true,
    weeklyReport: true,
    monthlyReport: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          {t('notifications.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('notifications.emailNotifications')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('notifications.salesNotifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.salesDescription')}</p>
              </div>
              <Switch
                checked={notifications.emailSales}
                onCheckedChange={() => handleToggle('emailSales')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('notifications.commentNotifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.commentDescription')}</p>
              </div>
              <Switch
                checked={notifications.emailComments}
                onCheckedChange={() => handleToggle('emailComments')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('notifications.followerNotifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.followerDescription')}</p>
              </div>
              <Switch
                checked={notifications.emailFollowers}
                onCheckedChange={() => handleToggle('emailFollowers')}
              />
            </div>
          </div>
        </div>

        {/* <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Push Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sales Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone purchases your beats</p>
              </div>
              <Switch
                checked={notifications.pushSales}
                onCheckedChange={() => handleToggle('pushSales')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Comment Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone comments on your beats</p>
              </div>
              <Switch
                checked={notifications.pushComments}
                onCheckedChange={() => handleToggle('pushComments')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Follower Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
              </div>
              <Switch
                checked={notifications.pushFollowers}
                onCheckedChange={() => handleToggle('pushFollowers')}
              />
            </div>
          </div>
        </div> */}
{/* 
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Reports</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={() => handleToggle('weeklyReport')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive monthly performance reports</p>
              </div>
              <Switch
                checked={notifications.monthlyReport}
                onCheckedChange={() => handleToggle('monthlyReport')}
              />
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
