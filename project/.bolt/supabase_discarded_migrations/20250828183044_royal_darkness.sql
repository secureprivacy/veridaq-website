/*
# Fix Post Publishing Permissions Only

This script only fixes the specific post policies causing the 400 Bad Request error
without touching other working functions and policies.

## What this fixes:
1. Removes problematic post policies
2. Creates new post policies using existing auth functions
3. Allows editors to publish/update any post
*/

-- Step 1: Remove only the problematic post policies
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can create posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

-- Step 2: Check if auth functions exist and create them if needed
DO $$
BEGIN
  -- Create is_admin function if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    AS $func$
      SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = COALESCE(user_uuid, auth.uid())
          AND r.name = 'admin'
      );
    $func$;
  END IF;

  -- Create is_editor_or_admin function if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_editor_or_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE OR REPLACE FUNCTION public.is_editor_or_admin(user_uuid uuid DEFAULT auth.uid())
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    AS $func$
      SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = COALESCE(user_uuid, auth.uid())
          AND r.name IN ('admin', 'editor')
      );
    $func$;
  END IF;
END $$;

-- Step 3: Grant permissions on the functions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) TO authenticated, anon;

-- Step 4: Create new post policies using the functions
CREATE POLICY "Editors can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin() AND author_id = auth.uid());

CREATE POLICY "Editors and admins can update posts"
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