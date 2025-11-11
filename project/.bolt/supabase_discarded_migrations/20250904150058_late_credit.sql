/*
# Disable RLS for Development

This script disables Row Level Security on all tables to make development easier.
RLS can be re-enabled later when moving to production.

## What this does:
1. Disables RLS on all content management tables
2. Removes all existing RLS policies
3. Allows unrestricted access for development
4. Eliminates authentication-related errors

## Tables affected:
- posts
- post_translations
- user_profiles
- user_roles
- roles
- api_settings
- categories
- tags
- post_categories
- post_tags
*/

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Demo users can manage all posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

-- Drop policies on other tables
DROP POLICY IF EXISTS "Anyone can read roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage api settings" ON public.api_settings;

-- Drop translation policies
DROP POLICY IF EXISTS "Anyone can read published post translations" ON public.post_translations;
DROP POLICY IF EXISTS "Authenticated users can read all translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors can create translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors can update translations" ON public.post_translations;
DROP POLICY IF EXISTS "Admins can delete translations" ON public.post_translations;

-- Drop category and tag policies
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
DROP POLICY IF EXISTS "Editors can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can read tags" ON public.tags;
DROP POLICY IF EXISTS "Editors can manage tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can read post categories" ON public.post_categories;
DROP POLICY IF EXISTS "Editors can manage post categories" ON public.post_categories;
DROP POLICY IF EXISTS "Anyone can read post tags" ON public.post_tags;
DROP POLICY IF EXISTS "Editors can manage post tags" ON public.post_tags;

-- Disable RLS on all tables
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags DISABLE ROW LEVEL SECURITY;

-- Optional: Drop the auth functions if they exist to prevent any confusion
DROP FUNCTION IF EXISTS auth.is_admin(uuid);
DROP FUNCTION IF EXISTS auth.is_editor_or_admin(uuid);