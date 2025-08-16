import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, AlertTriangle, Trash2 } from "lucide-react"
import React from "react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/contexts/LanguageContext"

// Kept props optional for compatibility, but only password + delete are used now
interface PrivacySettingsProps {
  privacy?: {
    profilePublic: boolean
    showSales: boolean
    showEarnings: boolean
    allowMessages: boolean
    showOnlineStatus: boolean
  }
  setPrivacy?: React.Dispatch<React.SetStateAction<{
    profilePublic: boolean
    showSales: boolean
    showEarnings: boolean
    allowMessages: boolean
    showOnlineStatus: boolean
  }>>
  showPassword?: boolean
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  showPassword,
  setShowPassword,
}) => {
  const { t } = useLanguage();
  
  // Fallback local state if not provided by parent
  const [localShowPassword, setLocalShowPassword] = React.useState(false)
  const sp = setShowPassword ?? setLocalShowPassword
  const sh = showPassword ?? localShowPassword

  const [confirmDelete, setConfirmDelete] = React.useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('privacy.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Update / Reset Password */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('privacy.updatePassword')}</h3>

          <div className="space-y-2">
            <Label htmlFor="current-password">{t('privacy.currentPassword')}</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={sh ? "text" : "password"}
                placeholder={t('privacy.enterCurrentPassword')}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => sp(!sh)}
                aria-label={sh ? "Hide password" : "Show password"}
              >
                {sh ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{t('privacy.newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder={t('privacy.enterNewPassword')}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('privacy.confirmNewPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t('privacy.confirmNewPasswordPlaceholder')}
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="default">{t('privacy.updatePasswordButton')}</Button>
            <Button variant="outline" type="button">{t('privacy.sendResetLink')}</Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('privacy.dangerZone')}</h3>
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-600" /> {t('privacy.deleteAccount')}</p>
                <p className="text-sm text-muted-foreground">{t('privacy.deleteAccountDescription')}</p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="shrink-0 flex items-center gap-2"><Trash2 className="h-4 w-4" /> {t('privacy.delete')}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('privacy.deleteYourAccount')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('privacy.confirmDelete')} <span className="font-semibold">DELETE</span> {t('privacy.below')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="my-2">
                    <Input
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder={t('privacy.typeDeleteConfirm')}
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('privacy.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={confirmDelete !== "DELETE"}
                    >
                      {t('privacy.permanentlyDelete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

export default PrivacySettings
