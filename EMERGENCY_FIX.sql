-- =====================================================
-- EMERGENCY FIX FOR SIGNUP ERRORS
-- =====================================================
-- This will create the missing tables and fix the signup
-- =====================================================

-- First, let's make sure we have the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- DROP EXISTING OBJECTS (if any)
-- =====================================================

-- Drop triggers first (including any variations of trigger names)
DROP TRIGGER IF EXISTS kababeat_on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS kababeat_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Drop triggers from tables that might exist
DO $$
BEGIN
    -- Try to drop trigger from kababeat_user_profiles if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kababeat_user_profiles' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS kababeat_update_user_profiles_updated_at ON public.kababeat_user_profiles;
    END IF;
    
    -- Try to drop trigger from user_profiles if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
    END IF;
END $$;

-- Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.kababeat_handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.kababeat_update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.kababeat_get_current_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.kababeat_check_username_availability(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.check_username_availability(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.kababeat_update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR) CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "kababeat_user_profiles_select_own" ON public.kababeat_user_profiles;
DROP POLICY IF EXISTS "kababeat_user_profiles_update_own" ON public.kababeat_user_profiles;
DROP POLICY IF EXISTS "kababeat_user_roles_select_own" ON public.kababeat_user_roles;

-- Drop tables
DROP TABLE IF EXISTS public.kababeat_user_roles;
DROP TABLE IF EXISTS public.kababeat_user_profiles;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- User profiles table
CREATE TABLE public.kababeat_user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    country VARCHAR(100) DEFAULT 'Nigeria',
    is_verified BOOLEAN DEFAULT false,
    is_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.kababeat_user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    permissions JSONB DEFAULT '{"can_upload": false, "can_purchase": true, "can_comment": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.kababeat_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kababeat_user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- User profiles policies
CREATE POLICY "kababeat_user_profiles_select_own" 
ON public.kababeat_user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "kababeat_user_profiles_update_own" 
ON public.kababeat_user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "kababeat_user_profiles_insert_own" 
ON public.kababeat_user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "kababeat_user_roles_select_own" 
ON public.kababeat_user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- =====================================================
-- CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.kababeat_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.kababeat_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    user_username VARCHAR(50);
    user_display_name VARCHAR(100);
    user_country VARCHAR(100);
    username_counter INTEGER := 0;
    final_username VARCHAR(50);
BEGIN
    -- Extract data from user metadata
    user_username := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
    user_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', user_username);
    user_country := COALESCE(NEW.raw_user_meta_data->>'country', 'Nigeria');
    
    -- Ensure username is unique
    final_username := user_username;
    WHILE EXISTS (SELECT 1 FROM public.kababeat_user_profiles WHERE username = final_username) LOOP
        username_counter := username_counter + 1;
        final_username := user_username || username_counter::text;
    END LOOP;
    
    -- Insert user profile
    INSERT INTO public.kababeat_user_profiles (
        user_id, 
        username, 
        display_name, 
        country
    ) VALUES (
        NEW.id,
        final_username,
        user_display_name,
        user_country
    );
    
    -- Insert default user role
    INSERT INTO public.kababeat_user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'KabaBeat: Error in new user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Function to get current user profile
CREATE OR REPLACE FUNCTION public.kababeat_get_current_user_profile()
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
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
    FROM public.kababeat_user_profiles up
    WHERE up.user_id = auth.uid();
END;
$$;

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.kababeat_check_username_availability(p_username VARCHAR(50))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.kababeat_user_profiles 
        WHERE username = p_username
    );
END;
$$;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.kababeat_update_user_profile(
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    UPDATE public.kababeat_user_profiles 
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
    FROM public.kababeat_user_profiles up
    WHERE up.user_id = auth.uid();
END;
$$;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for updated_at
CREATE TRIGGER kababeat_update_user_profiles_updated_at
    BEFORE UPDATE ON public.kababeat_user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.kababeat_update_updated_at();

-- Trigger for new user
CREATE TRIGGER kababeat_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.kababeat_handle_new_user();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.kababeat_user_profiles TO authenticated;
GRANT ALL ON TABLE public.kababeat_user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.kababeat_get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.kababeat_check_username_availability(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kababeat_update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR) TO authenticated;

-- Grant permissions to anon users (for username checking before signup)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON TABLE public.kababeat_user_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.kababeat_check_username_availability(VARCHAR) TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Emergency fix completed!' as status;

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'kababeat_%';

-- Verify functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'kababeat_%';
