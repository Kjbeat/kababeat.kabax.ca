import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Music, Eye, EyeOff, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getUserCountry } from "@/utils/geolocation";
import bgVideo from "@/assets/SignUpVideo.webm";

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

export function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: ""
  });
  const [error, setError] = useState("");
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const { signup, signupWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Detect user's country on component mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        setIsDetectingLocation(true);
        console.log('SignupForm: Starting country detection...');
        const country = await getUserCountry();
        console.log('SignupForm: Detected country:', country);
        setDetectedCountry(country);
      } catch (error) {
        console.error('SignupForm: Failed to detect country:', error);
        setDetectedCountry('Nigeria'); // Fallback
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectCountry();
  }, []);

  const generateUsername = (email: string): string => {
    // Extract the part before @ from email and add random numbers
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${baseUsername}${randomSuffix}`;
  };

  // Auto-generate username when email changes
  useEffect(() => {
    if (formData.email && !formData.username) {
      const generatedUsername = generateUsername(formData.email);
      setFormData(prev => ({ ...prev, username: generatedUsername }));
    }
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    
    try {
      console.log('SignupForm: Submitting signup with country:', detectedCountry);
      await signup(
        formData.email, 
        formData.password, 
        formData.username, 
        undefined, // firstName
        undefined, // lastName
        detectedCountry
      );
      toast({
        title: t('auth.accountCreatedSuccessfully'),
        description: t('auth.welcomeToKababeats'),
      });
      navigate("/explore");
    } catch (err) {
      setError(t('auth.failedToCreateAccount'));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = async () => {
    try {
      const username = generateUsername('google_user'); // Will be updated with actual email from Google
      console.log('SignupForm: Google signup with country:', detectedCountry);
      await signupWithGoogle(username, detectedCountry);
      toast({
        title: t('auth.accountCreatedSuccessfully'),
        description: t('auth.welcomeToKababeats'),
      });
      navigate("/explore");
    } catch (err) {
      setError(t('auth.failedToCreateAccountWithGoogle'));
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
      />
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="default" />
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">KABABEATS</h1>
            <Badge variant="secondary" className="ml-1">v2</Badge>
          </div>
          <p className="text-sm text-muted-foreground"> 
              {t('auth.createAccountToJoin')}
          </p>
        </div>

        <Card className="border shadow-sm">
                      <CardHeader>
              <CardTitle>{t('auth.createYourAccount')}</CardTitle>
              {/* <CardDescription>{t('auth.useGoogleOrEmail')}</CardDescription> */}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Location Detection Status */}
                {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {isDetectingLocation ? (
                    <span>{t('auth.detectingLocation')}</span>
                  ) : (
                    <span>{t('auth.detectedLocation')}: {detectedCountry}</span>
                  )}
                </div> */}

              {error && (
                <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="ghost"
                className="w-full border"
                onClick={handleGoogleSignup}
                disabled={loading || isDetectingLocation}
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
                    {t('auth.orCreateAccountWithEmail')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                

                <div className="space-y-2">
                  <Label htmlFor="username">{t('auth.username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t('auth.enterYourUsername')}
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    required
                  />
                </div>

              <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.enterYourEmail')}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder={t('auth.createAPassword')}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder={t('auth.confirmYourPassword')}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
                <Button type="submit" className="w-full" disabled={loading || isDetectingLocation}>
                  {loading ? t('auth.creatingAccount') : t('auth.createFreeAccount')}
                </Button>
              </form>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.alreadyHaveAccount')}{" "}
                <Link to="/login" className="text-primary hover:underline">
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
