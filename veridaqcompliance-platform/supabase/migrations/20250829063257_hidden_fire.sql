/*
# Disable RLS for Development Mode

⚠️ WARNING: This script disables Row Level Security for development purposes only.
DO NOT use this in production! All data will be accessible to anyone.

This script disables RLS on the main tables causing issues:
- posts (blog posts management)
- post_translations (multilingual content)
- user_roles (role assignments)  
- roles (role definitions)
- api_settings (API configuration)
- categories and tags (blog taxonomy)
*/

-- Disable RLS for posts table (main issue)
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- Disable RLS for related blog tables
ALTER TABLE public.post_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags DISABLE ROW LEVEL SECURITY;

-- Disable RLS for user management tables
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS for settings
ALTER TABLE public.api_settings DISABLE ROW LEVEL SECURITY;

-- Display current RLS status for verification
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('posts', 'post_translations', 'user_roles', 'roles', 'api_settings', 'categories', 'tags')
ORDER BY tablename;