import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Music, ArrowLeft, Mail, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { verifyEmailOTP, resendVerificationOTP, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = localStorage.getItem('pending-verification-email') || '';

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 7);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 7; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    setError("");
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit, index) => !digit && index >= pastedData.length);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pastedData.length, 6);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const otpString = otp.join('');
    if (otpString.length !== 7) {
      setError(t('auth.enterCompleteCode'));
      return;
    }
    
    try {
      await verifyEmailOTP(email, otpString);
      toast({
        title: t('auth.emailVerified'),
        description: t('auth.welcomeToKababeats'),
      });
      navigate("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.verificationFailed'));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      await resendVerificationOTP(email);
      setResendCooldown(60); // 60 seconds cooldown
      toast({
        title: t('auth.codeResent'),
        description: t('auth.checkYourEmail'),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.failedToResend'));
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>
                {t('auth.noVerificationEmail')}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link to="/signup" className="text-primary hover:underline">
                {t('auth.backToSignup')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
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
            {t('auth.verifyYourEmail')}
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('auth.emailVerification')}
            </CardTitle>
            <CardDescription>
              {t('auth.enterCodeSentTo')} <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <Label className="text-center block">{t('auth.enterVerificationCode')}</Label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-mono border-2 focus:border-primary"
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || otp.join('').length !== 7}
                >
                  {loading ? t('auth.verifying') : t('auth.verifyEmail')}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('auth.didntReceiveCode')}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className="text-primary hover:text-primary/80"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {t('auth.sending')}
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        {t('auth.resendIn')} {resendCooldown}s
                      </>
                    ) : (
                      t('auth.resendCode')
                    )}
                  </Button>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.wrongEmail')}{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  {t('auth.backToSignup')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
