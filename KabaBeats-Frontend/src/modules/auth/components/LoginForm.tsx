import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Music, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";


import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import bgVideo from "@/assets/SignInVideo.webm";

// Google Icon Component
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();


  const [showLoginPass, setShowLoginPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.loginSuccess'),
      });
      navigate("/explore");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.invalidCredentials');
      console.log('Login error message:', errorMessage); // Debug log
      
      // Check if it's an unverified email error
      if (errorMessage.includes('Email not verified')) {
        console.log('Redirecting to OTP verification page'); // Debug log
        // Store email for OTP verification
        localStorage.setItem('pending-verification-email', email);
        toast({
          title: t('auth.emailNotVerified'),
          description: t('auth.checkEmailForVerification'),
        });
        navigate("/verify-email");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    
    try {
      await loginWithGoogle();
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.googleLoginSuccess'),
      });
      navigate("/explore");
    } catch (err) {
      setError(t('auth.googleLoginFailed'));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover blur-sm"
        src={bgVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="default" />
      </div>

      <div className="relative w-full max-w-md">
        {/* existing content starts here */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">KABABEATS</h1>
            <Badge variant="secondary" className="ml-1">v2</Badge>
          </div>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{t('auth.welcomeBack')}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="ghost"
                className="w-full border"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <GoogleIcon />
                {t('auth.continueWithGoogle')}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('auth.orContinueWithEmail')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.enterYourEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showLoginPass ? "text" : "password"}
                    placeholder={t('auth.enterYourPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowLoginPass((v) => !v)}
                    aria-label={showLoginPass ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-right -mt-1">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.dontHaveAccount')}{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  {t('auth.signUpForFree')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
