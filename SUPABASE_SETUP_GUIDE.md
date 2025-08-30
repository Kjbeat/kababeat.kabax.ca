# 🚀 Supabase Authentication Setup Guide

## 📋 Prerequisites
- ✅ Supabase project created
- ✅ Database schema installed (from `SUPABASE_AUTH_SETUP.sql`)
- ✅ Security fixes applied (from `SUPABASE_AUTH_SECURITY_FIX.sql`)

## 🔧 Step 1: Configure Supabase Auth Settings

### 1.1 Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to **Authentication > Settings**

### 1.2 Configure Site URL
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add these URLs:
  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/login
  http://localhost:3000/signup
  ```

### 1.3 Enable Authentication Providers
- ✅ **Email/Password**: Enable
- ✅ **Google OAuth**: Enable (optional)

### 1.4 Configure Google OAuth (if using)
1. Go to **Authentication > Providers > Google**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### 1.5 Email Templates (Optional)
Customize email templates in **Authentication > Email Templates**:
- **Confirm signup**
- **Reset password**
- **Magic link**

## 🔑 Step 2: Get Your API Keys

### 2.1 Go to API Settings
1. Navigate to **Settings > API**
2. Copy your credentials:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)
   - **Service Role Key** (starts with `eyJ...`) - for admin operations

## 📝 Step 3: Create Environment File

### 3.1 Create `.env` file
Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations)
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3.2 Replace with your actual values
- Replace `https://your-project.supabase.co` with your actual Project URL
- Replace `your-anon-key-here` with your actual Anon Key

## 📦 Step 4: Install Dependencies

### 4.1 Install Supabase Client
```bash
npm install @supabase/supabase-js
```

## 🧪 Step 5: Test the Setup

### 5.1 Start your development server
```bash
npm run dev
```

### 5.2 Test Authentication Flow
1. Go to `http://localhost:3000/signup`
2. Create a new account
3. Verify the user is created in Supabase dashboard
4. Test login functionality
5. Test logout functionality

### 5.3 Check Database
1. Go to **Table Editor** in Supabase dashboard
2. Check that users are created in:
   - `auth.users` (Supabase auth table)
   - `public.user_profiles` (your custom profile table)
   - `public.user_roles` (user roles table)

## 🔍 Step 6: Verify Everything Works

### 6.1 Check Console for Errors
- Open browser developer tools
- Check console for any authentication errors
- Verify network requests to Supabase

### 6.2 Test User Profile
- After login, check that user profile data is loaded
- Verify username, email, country are displayed correctly

### 6.3 Test Google OAuth (if enabled)
1. Click "Continue with Google" on login/signup
2. Complete Google authentication
3. Verify user profile is created

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env` file exists
   - Verify variable names start with `VITE_`
   - Restart your dev server

2. **"Invalid API key"**
   - Verify your Anon Key is correct
   - Check for extra spaces or characters

3. **"Redirect URL mismatch"**
   - Add your localhost URL to Supabase redirect URLs
   - Check the exact URL format

4. **"User profile not found"**
   - Check if the trigger function is working
   - Verify RLS policies are correct

5. **Google OAuth not working**
   - Verify Google OAuth credentials
   - Check redirect URLs in Google Cloud Console
   - Ensure Google provider is enabled in Supabase

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase dashboard logs
3. Verify all environment variables are set
4. Ensure database schema is properly installed

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database schema installed
- [ ] Security fixes applied
- [ ] Auth settings configured
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Google OAuth works (if enabled)
- [ ] User profiles are created automatically
- [ ] No console errors

**🎉 Congratulations! Your Supabase authentication is now fully set up and working!**
