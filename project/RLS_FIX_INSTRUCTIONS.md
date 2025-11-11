# How to Fix RLS Infinite Recursion Error

## Step 1: Go to your Supabase Dashboard
1. Open https://supabase.com
2. Go to your project
3. Navigate to SQL Editor

## Step 2: Run Script 1 - Drop Recursive Policies

Copy and paste this SQL into the SQL Editor and run it:

```sql
/*
# Drop Recursive RLS Policies

This script removes all RLS policies that are causing infinite recursion.
The main issue is policies on the 'roles' table that try to JOIN the 'roles' table within their own policy definition.

## What this fixes:
1. Removes circular dependency in roles table policies
2. Removes problematic policies on user_roles table
3. Prepares for new safe policies
*/

-- Drop all problematic policies on roles table
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
DROP POLICY IF EXISTS "Everyone can read roles" ON public.roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.roles;

-- Drop problematic policies on user_roles table
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read all role assignments" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can see own role assignments" ON public.user_roles;

-- Drop problematic policies on api_settings table
DROP POLICY IF EXISTS "Admins can manage api settings" ON public.api_settings;
DROP POLICY IF EXISTS "Admins can read api settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can manage API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can manage api settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can read api settings" ON public.api_settings;

-- Drop problematic policies on posts table
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts or admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can create posts" ON public.posts;

-- Drop problematic policies on post_translations table
DROP POLICY IF EXISTS "Admins can delete translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors and admins can create translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors and admins can update translations" ON public.post_translations;

-- Drop problematic policies on categories table
DROP POLICY IF EXISTS "Editors and admins can manage categories" ON public.categories;

-- Drop problematic policies on tags table
DROP POLICY IF EXISTS "Editors and admins can manage tags" ON public.tags;

-- Drop problematic policies on post_categories table
DROP POLICY IF EXISTS "Editors and admins can manage post categories" ON public.post_categories;

-- Drop problematic policies on post_tags table
DROP POLICY IF EXISTS "Editors and admins can manage post tags" ON public.post_tags;

-- Drop any problematic functions that might cause recursion
DROP FUNCTION IF EXISTS is_user_admin();
DROP FUNCTION IF EXISTS is_user_editor_or_admin();
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_admin();
```

## Step 3: Run Script 2 - Create Safe Functions

Copy and paste this SQL into the SQL Editor and run it:

```sql
/*
# Create Safe Authentication Functions

This script creates security definer functions that can safely check user roles
without triggering RLS policies, preventing infinite recursion.

## What this creates:
1. Safe function to check if user is admin
2. Safe function to check if user is editor or admin
3. These functions use SECURITY DEFINER to bypass RLS
*/

-- Create safe admin check function
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

-- Create safe editor or admin check function
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

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION auth.is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auth.is_editor_or_admin(uuid) TO authenticated, anon;
```

## Step 4: Run Script 3 - Create New Safe Policies

Copy and paste this SQL into the SQL Editor and run it:

```sql
/*
# Create Non-Recursive RLS Policies

This script creates new RLS policies that use the safe authentication functions,
preventing infinite recursion while maintaining proper access control.

## What this creates:
1. Safe policies for roles table
2. Safe policies for user_roles table
3. Safe policies for content management tables
4. All policies use the auth.* functions to avoid recursion
*/

-- Roles table policies
CREATE POLICY "Anyone can read roles"
  ON public.roles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.roles
  FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- User roles table policies
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY "Service role can manage user roles"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- API Settings policies
CREATE POLICY "Admins can manage api settings"
  ON public.api_settings
  FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Posts policies
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
  WITH CHECK (auth.is_editor_or_admin() AND author_id = auth.uid());

CREATE POLICY "Authors can update own posts, admins can update any"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR auth.is_admin())
  WITH CHECK (author_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Admins can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- Post translations policies
CREATE POLICY "Anyone can read published post translations"
  ON public.post_translations
  FOR SELECT
  TO authenticated, anon
  USING (EXISTS (
    SELECT 1 FROM posts p 
    WHERE p.id = post_translations.post_id 
    AND p.status = 'published'
  ));

CREATE POLICY "Authenticated users can read all translations"
  ON public.post_translations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can create translations"
  ON public.post_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_editor_or_admin());

CREATE POLICY "Editors can update translations"
  ON public.post_translations
  FOR UPDATE
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());

CREATE POLICY "Admins can delete translations"
  ON public.post_translations
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- Categories policies
CREATE POLICY "Anyone can read categories"
  ON public.categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Editors can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());

-- Tags policies  
CREATE POLICY "Anyone can read tags"
  ON public.tags
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Editors can manage tags"
  ON public.tags
  FOR ALL
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());

-- Post categories policies
CREATE POLICY "Anyone can read post categories"
  ON public.post_categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Editors can manage post categories"
  ON public.post_categories
  FOR ALL
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());

-- Post tags policies
CREATE POLICY "Anyone can read post tags"
  ON public.post_tags
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Editors can manage post tags"
  ON public.post_tags
  FOR ALL
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());
```

## Step 5: Test the Fix

After running all three scripts, test your application. The infinite recursion error should be resolved.

## What Was Fixed:

1. **Moved auth functions to `auth` schema** - This prevents them from being affected by RLS on public tables
2. **Used `SECURITY DEFINER`** - This allows the functions to bypass RLS when checking roles
3. **Simplified policy logic** - Policies now use simple function calls instead of complex subqueries
4. **Removed circular dependencies** - No more policies that query the same table they're protecting

Run these scripts in order in your Supabase SQL Editor and the recursion error should be fixed.