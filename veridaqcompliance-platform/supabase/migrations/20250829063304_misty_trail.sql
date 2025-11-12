/*
# Re-enable RLS for Production

🔒 IMPORTANT: Run this script before deploying to production!
This re-enables Row Level Security for all tables.
*/

-- Re-enable RLS for posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS for related blog tables
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS for user management tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS for settings
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- Display current RLS status for verification
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('posts', 'post_translations', 'user_roles', 'roles', 'api_settings', 'categories', 'tags')
ORDER BY tablename;