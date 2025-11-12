/*
# Create Authentication Functions in Public Schema

This script creates the missing authentication functions in the public schema 
since we don't have permissions to create them in the auth schema.

## What this creates:
1. Safe functions to check if user is admin
2. Safe functions to check if user is editor or admin
3. Updated RLS policies that use these functions
4. All functions use SECURITY DEFINER to bypass RLS
*/

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

-- Now fix the post policies to use public schema functions
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can create posts" ON public.posts;

-- Create new policies using public schema functions
CREATE POLICY "Editors and admins can update any post"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Editors and admins can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin() AND author_id = auth.uid());

-- Also update other policies that might be using the auth schema functions
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

CREATE POLICY "Admins can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());