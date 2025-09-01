import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = React.useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Authentication failed. Please try again.');
          setStatus('error');
          return;
        }

        if (!token || !refresh) {
          setError('Missing authentication tokens. Please try again.');
          setStatus('error');
          return;
        }

        // Handle the OAuth callback with the tokens
        await handleOAuthCallback(token, refresh);
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]); // Removed handleOAuthCallback from dependencies

  const handleRetry = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Authentication</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your authentication...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we complete your authentication...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground text-center">
                You have been successfully authenticated. Redirecting to your dashboard...
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2 w-full">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleGoHome} className="flex-1">
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
