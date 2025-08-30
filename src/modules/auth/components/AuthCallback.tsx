import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Music, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const africanCountries = [
    "Nigeria", "Ghana", "Kenya", "South Africa", "Senegal", "Morocco", "Egypt", 
    "Ethiopia", "Uganda", "Tanzania", "Cameroon", "Ivory Coast", "Zimbabwe", 
    "Mali", "Burkina Faso", "Other"
  ];

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, show username form
            setShowUsernameForm(true);
            setLoading(false);
            return;
          }

          if (profileError) {
            throw profileError;
          }

          // Profile exists, redirect to explore
          navigate('/explore');
        } else {
          // No session, redirect to login
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handleCompleteProfile = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    try {
      // Check if username is available
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        setError('Username already exists');
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          username,
          display_name: username,
          country,
        });

      if (profileError) {
        throw profileError;
      }

      // Redirect to explore
      navigate('/explore');
    } catch (err) {
      console.error('Complete profile error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete profile');
      setLoading(false);
    }
  };

  if (loading && !showUsernameForm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Music className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">KABABEATS</h1>
            </div>
            <CardTitle>Completing Authentication</CardTitle>
            <CardDescription>Please wait while we set up your account...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Setting up your profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showUsernameForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Music className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">KABABEATS</h1>
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please provide a username to complete your account setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {africanCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                onClick={handleCompleteProfile}
                disabled={loading || !username.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Music className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">KABABEATS</h1>
            </div>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
