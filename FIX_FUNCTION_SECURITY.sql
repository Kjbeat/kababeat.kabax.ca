-- =====================================================
-- FIX FUNCTION SECURITY WARNINGS
-- =====================================================
-- Run this to fix the "Function Search Path Mutable" warnings
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
-- VERIFICATION
-- =====================================================

SELECT 'Function security warnings fixed!' as status;

-- Show functions with proper search_path
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'kababeat_%'
AND routine_definition LIKE '%SET search_path%'
ORDER BY routine_name;

-- =====================================================
-- SECURITY WARNINGS SHOULD NOW BE RESOLVED!
-- =====================================================
