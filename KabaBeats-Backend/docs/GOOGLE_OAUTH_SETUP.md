# Google OAuth Setup Guide for KabaBeats

## 🔗 **Google OAuth Redirect URLs**

### **Development Environment:**
```
http://localhost:3000/api/v1/auth/google/callback
```

### **Production Environment:**
```
https://yourdomain.com/api/v1/auth/google/callback
```

### **Staging Environment (if applicable):**
```
https://staging.yourdomain.com/api/v1/auth/google/callback
```

## 📋 **Step-by-Step Setup**

### **1. Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Create a new project or select an existing one
   - Name it "KabaBeats" or similar

3. **Enable Google+ API**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" or "Google Identity"
   - Click on it and press **Enable**

4. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application** as the application type

5. **Configure OAuth Consent Screen**
   - If prompted, configure the OAuth consent screen
   - Fill in the required information:
     - **App name**: KabaBeats
     - **User support email**: your-email@domain.com
     - **Developer contact information**: your-email@domain.com
   - Add your domain to **Authorized domains**

6. **Set Up Authorized Redirect URIs**
   - In the OAuth 2.0 Client ID configuration
   - Add these **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/v1/auth/google/callback
     https://yourdomain.com/api/v1/auth/google/callback
     ```

### **2. Environment Configuration**

Update your `.env` file with the Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

### **3. Frontend Integration**

#### **Google OAuth Button Component**
```typescript
// components/GoogleAuthButton.tsx
import React from 'react';

const GoogleAuthButton: React.FC = () => {
  const handleGoogleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback';
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(7);
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `state=${state}`;
    
    window.location.href = googleAuthUrl;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
};

export default GoogleAuthButton;
```

#### **Auth Callback Handler**
```typescript
// pages/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      navigate('/login?error=authentication_failed');
      return;
    }

    if (token && refresh) {
      // Store tokens in localStorage or secure storage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
```

### **4. Backend API Endpoints**

Your backend now has these Google OAuth endpoints:

#### **Initiate Google OAuth**
```typescript
// Frontend redirects user to:
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/api/v1/auth/google/callback&
  scope=email profile&
  response_type=code&
  state=RANDOM_STATE
```

#### **Google OAuth Callback**
```
GET /api/v1/auth/google/callback?code=AUTH_CODE&state=STATE
```

This endpoint:
1. Exchanges the authorization code for an access token
2. Fetches user information from Google
3. Creates or updates the user in your database
4. Generates JWT tokens
5. Redirects to your frontend with the tokens

### **5. Testing the Integration**

#### **Test the OAuth Flow**
1. **Start your backend server:**
   ```bash
   npm run dev
   ```

2. **Test the callback endpoint:**
   ```bash
   curl "http://localhost:3000/api/v1/auth/google/callback?code=test_code"
   ```

3. **Test with a real Google account:**
   - Click the Google login button
   - Complete the OAuth flow
   - Verify tokens are received

#### **Common Issues and Solutions**

**Issue: "redirect_uri_mismatch"**
- **Solution**: Ensure the redirect URI in Google Console exactly matches your environment variable

**Issue: "invalid_client"**
- **Solution**: Check that your Google Client ID and Secret are correct

**Issue: "access_denied"**
- **Solution**: User denied permission or OAuth consent screen needs configuration

**Issue: "invalid_grant"**
- **Solution**: Authorization code expired (they expire quickly) or already used

### **6. Production Considerations**

#### **Security Best Practices**
- ✅ **Use HTTPS** in production
- ✅ **Validate state parameter** to prevent CSRF attacks
- ✅ **Store tokens securely** (httpOnly cookies recommended)
- ✅ **Implement token refresh** logic
- ✅ **Log authentication events** for monitoring

#### **Environment Variables for Production**
```bash
# Production Environment
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

#### **OAuth Consent Screen for Production**
- **App name**: KabaBeats
- **User support email**: support@kababeats.com
- **App logo**: Upload your app logo
- **App domain**: yourdomain.com
- **Developer contact**: your-email@domain.com
- **Scopes**: email, profile
- **Test users**: Add test users during development

### **7. Monitoring and Analytics**

#### **Track OAuth Events**
```typescript
// In your auth service
logger.info('Google OAuth login attempt', {
  email: googleUser.email,
  timestamp: new Date(),
  userAgent: req.headers['user-agent'],
  ip: req.ip
});

logger.info('Google OAuth login success', {
  userId: user._id,
  email: user.email,
  isNewUser: !existingUser
});
```

#### **Error Monitoring**
- Set up alerts for OAuth failures
- Monitor authentication success rates
- Track user registration vs login patterns

## 🎯 **Quick Setup Checklist**

- [ ] Create Google Cloud Project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID
- [ ] Configure OAuth consent screen
- [ ] Add redirect URIs
- [ ] Update environment variables
- [ ] Test OAuth flow
- [ ] Implement frontend integration
- [ ] Set up error handling
- [ ] Configure production settings

## 📞 **Support**

If you encounter issues:
1. Check the Google Cloud Console for error details
2. Verify your redirect URIs match exactly
3. Ensure your OAuth consent screen is properly configured
4. Check your environment variables
5. Review the server logs for detailed error messages

---

**Your Google OAuth integration is now ready!** Users can sign in with their Google accounts and you'll receive their profile information securely.
