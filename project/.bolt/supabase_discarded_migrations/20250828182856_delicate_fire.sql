/*
# Fix Post Update Permissions - Handle Existing Policies

This script fixes the RLS policies that prevent editors from updating posts.
It carefully drops existing policies to avoid conflicts before creating new ones.

## What this fixes:
1. Drops ALL existing problematic policies on posts table
2. Creates safe authentication functions in public schema
3. Creates new policies allowing editors to update any post
4. Handles conflicts with existing policies
*/

-- First, drop ALL existing post policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can read all posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can create posts" ON public.posts;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_editor_or_admin();
DROP FUNCTION IF EXISTS public.is_editor_or_admin(uuid);

-- Create safe admin check function in public schema
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
      AND r.name = 'admin'
  );
$$;

-- Create safe editor or admin check function in public schema
CREATE OR REPLACE FUNCTION public.is_editor_or_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
      AND r.name IN ('admin', 'editor')
  );
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) TO authenticated, anon;

-- Now create all post policies fresh
CREATE POLICY "Anyone can read published posts"
  ON public.posts
  FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin() AND author_id = auth.uid());

CREATE POLICY "Editors can update any post"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Admins can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());