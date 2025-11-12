/*
# Disable RLS for Development Mode

This script disables Row Level Security (RLS) for all tables to simplify development.
In development, we don't need complex authentication - we just want the CMS to work.

## What this does:
1. Drops all existing RLS policies that are causing errors
2. Disables RLS on all tables
3. Allows unrestricted access for development
4. Eliminates schema access errors

## Note: 
In production, you would re-enable RLS with proper policies.
For development/demo purposes, this removes all authentication barriers.
*/

-- Drop all existing policies that might be causing recursion errors
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
DROP POLICY IF EXISTS "Editors and admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can read own posts" ON public.posts;
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

-- Drop any problematic authentication functions
DROP FUNCTION IF EXISTS auth.is_admin(uuid);
DROP FUNCTION IF EXISTS auth.is_editor_or_admin(uuid);
DROP FUNCTION IF EXISTS is_user_admin();
DROP FUNCTION IF EXISTS is_user_editor_or_admin();
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_admin();

-- Disable RLS on all tables for development
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

-- Grant full access to authenticated and anon users for development
GRANT ALL ON public.user_profiles TO authenticated, anon;
GRANT ALL ON public.user_roles TO authenticated, anon;
GRANT ALL ON public.roles TO authenticated, anon;
GRANT ALL ON public.posts TO authenticated, anon;
GRANT ALL ON public.post_translations TO authenticated, anon;
GRANT ALL ON public.api_settings TO authenticated, anon;
GRANT ALL ON public.categories TO authenticated, anon;
GRANT ALL ON public.tags TO authenticated, anon;
GRANT ALL ON public.post_categories TO authenticated, anon;
GRANT ALL ON public.post_tags TO authenticated, anon;

-- Grant usage on all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;