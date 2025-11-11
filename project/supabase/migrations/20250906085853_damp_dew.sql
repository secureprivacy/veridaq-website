/*
# Completely Disable RLS for Development

This script removes all RLS policies and disables RLS entirely to prevent
"schema net does not exist" and other RLS-related errors during development.

## What this fixes:
1. Drops all existing RLS policies on all tables
2. Disables RLS on all tables
3. Removes problematic authentication functions
4. Ensures clean development environment
*/

-- Drop all RLS policies from all tables
DROP POLICY IF EXISTS "Anyone can read roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage api settings" ON public.api_settings;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can read all posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read published post translations" ON public.post_translations;
DROP POLICY IF EXISTS "Authenticated users can read all translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors can create translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors can update translations" ON public.post_translations;
DROP POLICY IF EXISTS "Admins can delete translations" ON public.post_translations;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
DROP POLICY IF EXISTS "Editors can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can read tags" ON public.tags;
DROP POLICY IF EXISTS "Editors can manage tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can read post categories" ON public.post_categories;
DROP POLICY IF EXISTS "Editors can manage post categories" ON public.post_categories;
DROP POLICY IF EXISTS "Anyone can read post tags" ON public.post_tags;
DROP POLICY IF EXISTS "Editors can manage post tags" ON public.post_tags;

-- Drop any other policies that might exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags DISABLE ROW LEVEL SECURITY;

-- Drop any problematic authentication functions
DROP FUNCTION IF EXISTS auth.is_admin(uuid);
DROP FUNCTION IF EXISTS auth.is_editor_or_admin(uuid);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_editor_or_admin(uuid);
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_editor_or_admin(uuid);
DROP FUNCTION IF EXISTS is_user_admin();
DROP FUNCTION IF EXISTS is_user_editor_or_admin();

-- Ensure all tables are accessible without authentication
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;