-- =====================================================
-- QUICK FIX for KabaBeat Authentication
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the immediate issue
-- =====================================================

-- 1. Drop any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- 2. Drop any existing functions that might be causing issues
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a simple user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  country VARCHAR(100) DEFAULT 'Nigeria',
  is_verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create a simple user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Create basic RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.user_roles TO anon, authenticated;

-- 8. Create a simple trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_catalog;
  
  -- Get username from metadata or generate one
  DECLARE
    user_username VARCHAR(50);
    user_display_name VARCHAR(100);
    user_country VARCHAR(100);
  BEGIN
    -- Extract username from metadata
    user_username := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', user_username);
    user_country := COALESCE(NEW.raw_user_meta_data->>'country', 'Nigeria');
    
    -- Create user profile with proper username and display name
    INSERT INTO public.user_profiles (user_id, username, display_name, country)
    VALUES (
      NEW.id,
      user_username,
      user_display_name,
      user_country
    );
    
    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't break signup
      RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Create helper functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, pg_catalog;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username VARCHAR(50),
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  country VARCHAR(100),
  is_verified BOOLEAN,
  is_creator BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  SET search_path = public, pg_catalog;
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.bio,
    up.country,
    up.is_verified,
    up.is_creator,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_availability(p_username VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  SET search_path = public, pg_catalog;
  RETURN NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE username = p_username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_display_name VARCHAR(100) DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_country VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username VARCHAR(50),
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  country VARCHAR(100),
  is_verified BOOLEAN,
  is_creator BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  SET search_path = public, pg_catalog;
  
  UPDATE public.user_profiles 
  SET 
    display_name = COALESCE(p_display_name, display_name),
    bio = COALESCE(p_bio, bio),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    country = COALESCE(p_country, country),
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.bio,
    up.country,
    up.is_verified,
    up.is_creator,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_availability(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR) TO anon, authenticated;

-- 11. Verify setup
SELECT 'Quick fix applied successfully!' as status;
SELECT COUNT(*) as user_profiles_count FROM public.user_profiles;
SELECT COUNT(*) as user_roles_count FROM public.user_roles;

-- =====================================================
-- QUICK FIX COMPLETE!
-- =====================================================
-- Now try signing up again - it should work!
-- =====================================================
