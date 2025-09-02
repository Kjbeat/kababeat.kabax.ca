import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, AlertTriangle, Trash2, Loader2 } from "lucide-react"
import React, { useState } from "react"
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
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

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
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Fallback local state if not provided by parent
  const [localShowPassword, setLocalShowPassword] = React.useState(false)
  const sp = setShowPassword ?? setLocalShowPassword
  const sh = showPassword ?? localShowPassword

  const [confirmDelete, setConfirmDelete] = React.useState("")
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Password changed successfully!",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (confirmDelete !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch('/api/v1/auth/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          password: passwordData.currentPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        });
        // Logout and redirect
        await logout();
        window.location.href = '/';
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

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
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
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
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('privacy.confirmNewPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder={t('privacy.confirmNewPasswordPlaceholder')}
              autoComplete="new-password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                t('privacy.updatePasswordButton')
              )}
            </Button>
            <Button variant="outline" type="button" onClick={() => window.location.href = '/forgot-password'}>
              {t('privacy.sendResetLink')}
            </Button>
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
                      disabled={confirmDelete !== "DELETE" || isDeletingAccount}
                      onClick={handleDeleteAccount}
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        t('privacy.permanentlyDelete')
                      )}
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
