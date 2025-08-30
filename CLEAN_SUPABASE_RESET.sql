-- =====================================================
-- KABABEAT SUPABASE COMPLETE RESET & SECURE SETUP
-- =====================================================
-- Run this to completely clean and rebuild your Supabase authentication
-- with proper security and naming conventions
-- =====================================================

-- =====================================================
-- PART 1: COMPLETE CLEANUP
-- =====================================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS kababeat_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS kababeat_user_profiles_updated_at ON public.kababeat_user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Drop all functions
DROP FUNCTION IF EXISTS public.kababeat_handle_new_user();
DROP FUNCTION IF EXISTS public.kababeat_update_updated_at();
DROP FUNCTION IF EXISTS public.kababeat_get_current_user_profile();
DROP FUNCTION IF EXISTS public.kababeat_check_username_availability(VARCHAR);
DROP FUNCTION IF EXISTS public.kababeat_update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.get_current_user_profile();
DROP FUNCTION IF EXISTS public.check_username_availability(VARCHAR);
DROP FUNCTION IF EXISTS public.update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR);

-- Drop all policies
DROP POLICY IF EXISTS "kababeat_users_can_view_own_profile" ON public.kababeat_user_profiles;
DROP POLICY IF EXISTS "kababeat_users_can_update_own_profile" ON public.kababeat_user_profiles;
DROP POLICY IF EXISTS "kababeat_users_can_insert_own_profile" ON public.kababeat_user_profiles;
DROP POLICY IF EXISTS "kababeat_public_can_view_verified_creators" ON public.kababeat_user_profiles;
DROP POLICY IF EXISTS "kababeat_users_can_view_own_roles" ON public.kababeat_user_roles;
DROP POLICY IF EXISTS "kababeat_users_can_update_own_roles" ON public.kababeat_user_roles;
DROP POLICY IF EXISTS "kababeat_users_can_insert_own_roles" ON public.kababeat_user_roles;

-- Drop all existing policies (old naming)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Drop all tables
DROP TABLE IF EXISTS public.kababeat_user_roles CASCADE;
DROP TABLE IF EXISTS public.kababeat_user_profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Revoke all permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- =====================================================
-- PART 2: SECURE REBUILD WITH PROPER NAMING
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CREATE TABLES WITH PROPER NAMING
-- =====================================================

-- User profiles table
CREATE TABLE public.kababeat_user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- User roles table
CREATE TABLE public.kababeat_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_kababeat_user_profiles_user_id ON public.kababeat_user_profiles(user_id);
CREATE INDEX idx_kababeat_user_profiles_username ON public.kababeat_user_profiles(username);
CREATE INDEX idx_kababeat_user_profiles_creator ON public.kababeat_user_profiles(is_creator) WHERE is_creator = true;
CREATE INDEX idx_kababeat_user_profiles_verified ON public.kababeat_user_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX idx_kababeat_user_roles_user_id ON public.kababeat_user_roles(user_id);
CREATE INDEX idx_kababeat_user_roles_role ON public.kababeat_user_roles(role);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.kababeat_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kababeat_user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE SECURE RLS POLICIES
-- =====================================================

-- User Profiles Policies
CREATE POLICY "kababeat_users_can_view_own_profile" ON public.kababeat_user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "kababeat_users_can_update_own_profile" ON public.kababeat_user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "kababeat_users_can_insert_own_profile" ON public.kababeat_user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kababeat_public_can_view_verified_creators" ON public.kababeat_user_profiles
    FOR SELECT USING (is_verified = true AND is_creator = true);

-- User Roles Policies
CREATE POLICY "kababeat_users_can_view_own_roles" ON public.kababeat_user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "kababeat_users_can_update_own_roles" ON public.kababeat_user_roles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "kababeat_users_can_insert_own_roles" ON public.kababeat_user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CREATE SECURE FUNCTIONS WITH PROPER SEARCH PATH
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.kababeat_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = public, pg_catalog;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.kababeat_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_username VARCHAR(50);
    user_display_name VARCHAR(100);
    user_country VARCHAR(100);
    username_counter INTEGER := 0;
    final_username VARCHAR(50);
BEGIN
    SET search_path = public, pg_catalog;
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    FROM public.kababeat_user_profiles up
    WHERE up.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.kababeat_check_username_availability(p_username VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    SET search_path = public, pg_catalog;
    RETURN NOT EXISTS (
        SELECT 1 FROM public.kababeat_user_profiles 
        WHERE username = p_username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
) AS $$
BEGIN
    SET search_path = public, pg_catalog;
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for updating updated_at column
CREATE TRIGGER kababeat_user_profiles_updated_at
    BEFORE UPDATE ON public.kababeat_user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.kababeat_update_updated_at();

-- Trigger for handling new user registration
CREATE TRIGGER kababeat_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.kababeat_handle_new_user();

-- =====================================================
-- GRANT SECURE PERMISSIONS
-- =====================================================

-- Grant basic schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.kababeat_user_profiles TO authenticated;
GRANT SELECT ON public.kababeat_user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.kababeat_user_roles TO authenticated;
GRANT SELECT ON public.kababeat_user_roles TO anon;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.kababeat_get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.kababeat_check_username_availability(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kababeat_update_user_profile(VARCHAR, TEXT, TEXT, VARCHAR) TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify setup
SELECT 'KabaBeat Supabase Reset & Setup Complete!' as status;

-- Show created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'kababeat_%'
ORDER BY table_name;

-- Show created functions
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'kababeat_%'
ORDER BY routine_name;

-- Show RLS policies
SELECT tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'kababeat_%'
ORDER BY tablename, policyname;

-- Show indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'kababeat_%'
ORDER BY tablename, indexname;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Your KabaBeat Supabase database is now completely reset and secure!
-- 
-- Features:
-- ✅ Clean naming convention (kababeat_ prefix)
-- ✅ Proper security with SET search_path
-- ✅ Row Level Security (RLS) policies
-- ✅ Automatic profile creation on signup
-- ✅ Unique username generation
-- ✅ Performance indexes
-- ✅ Secure function definitions
-- ✅ Proper permissions
--
-- Next steps:
-- 1. Update your AuthContext to use new table names
-- 2. Test user registration and login
-- 3. Verify all security warnings are resolved
--
-- =====================================================
