/*
# Create Missing Authentication Functions

This migration creates the missing authentication functions that are needed for RLS policies.
The functions check user roles safely without causing infinite recursion.

## What this creates:
1. Safe function to check if user is admin
2. Safe function to check if user is editor or admin
3. These functions use SECURITY DEFINER to bypass RLS
*/

-- Create safe admin check function in auth schema
CREATE OR REPLACE FUNCTION auth.is_admin(user_uuid uuid DEFAULT auth.uid())
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

-- Create safe editor or admin check function in auth schema  
CREATE OR REPLACE FUNCTION auth.is_editor_or_admin(user_uuid uuid DEFAULT auth.uid())
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

-- Grant execution permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION auth.is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auth.is_editor_or_admin(uuid) TO authenticated, anon;

-- Now fix the post policies
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;

-- Create new policies that allow editors to manage posts
CREATE POLICY "Editors and admins can update any post"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());

CREATE POLICY "Editors and admins can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_editor_or_admin() AND author_id = auth.uid());