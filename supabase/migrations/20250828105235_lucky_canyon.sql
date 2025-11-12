/*
  # Create Non-Recursive RLS Policies

  1. New Policies
     - Simple read access for authenticated users on roles table
     - Safe admin checks using security definer functions
     - Proper policies for user_roles, api_settings, and posts tables
     
  2. Security
     - All policies use the new security definer functions
     - No direct table joins within policies to prevent recursion
     - Clear separation of concerns
*/

-- Simple policies for roles table (no recursion)
CREATE POLICY "Authenticated users can read roles"
    ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage roles"
    ON public.roles
    FOR ALL
    TO authenticated
    USING (is_user_admin())
    WITH CHECK (is_user_admin());

-- Safe policies for user_roles table
CREATE POLICY "Users can read own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can read all role assignments"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage user roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (is_user_admin())
    WITH CHECK (is_user_admin());

-- Safe policies for api_settings table
CREATE POLICY "Admins can read api settings"
    ON public.api_settings
    FOR SELECT
    TO authenticated
    USING (is_user_admin());

CREATE POLICY "Admins can manage api settings"
    ON public.api_settings
    FOR ALL
    TO authenticated
    USING (is_user_admin())
    WITH CHECK (is_user_admin());

-- Update posts policies to use the new functions
DROP POLICY IF EXISTS "Authors can update their own posts or admins can update any" ON public.posts;
DROP POLICY IF EXISTS "Editors and admins can create posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can delete posts" ON public.posts;

CREATE POLICY "Authors can update own posts or admins can update any"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid() OR is_user_admin())
    WITH CHECK (author_id = auth.uid() OR is_user_admin());

CREATE POLICY "Editors and admins can create posts"
    ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (is_user_editor_or_admin() AND author_id = auth.uid());

CREATE POLICY "Admins can delete posts"
    ON public.posts
    FOR DELETE
    TO authenticated
    USING (is_user_admin());

-- Update translation policies
DROP POLICY IF EXISTS "Editors and admins can create translations" ON public.post_translations;
DROP POLICY IF EXISTS "Editors and admins can update translations" ON public.post_translations;
DROP POLICY IF EXISTS "Only admins can delete translations" ON public.post_translations;

CREATE POLICY "Editors and admins can create translations"
    ON public.post_translations
    FOR INSERT
    TO authenticated
    WITH CHECK (is_user_editor_or_admin());

CREATE POLICY "Editors and admins can update translations"
    ON public.post_translations
    FOR UPDATE
    TO authenticated
    USING (is_user_editor_or_admin())
    WITH CHECK (is_user_editor_or_admin());

CREATE POLICY "Admins can delete translations"
    ON public.post_translations
    FOR DELETE
    TO authenticated
    USING (is_user_admin());

-- Update category and tag policies
DROP POLICY IF EXISTS "Editors and admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Editors and admins can manage tags" ON public.tags;
DROP POLICY IF EXISTS "Editors and admins can manage post categories" ON public.post_categories;
DROP POLICY IF EXISTS "Editors and admins can manage post tags" ON public.post_tags;

CREATE POLICY "Editors and admins can manage categories"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (is_user_editor_or_admin())
    WITH CHECK (is_user_editor_or_admin());

CREATE POLICY "Editors and admins can manage tags"
    ON public.tags
    FOR ALL
    TO authenticated
    USING (is_user_editor_or_admin())
    WITH CHECK (is_user_editor_or_admin());

CREATE POLICY "Editors and admins can manage post categories"
    ON public.post_categories
    FOR ALL
    TO authenticated
    USING (is_user_editor_or_admin())
    WITH CHECK (is_user_editor_or_admin());

CREATE POLICY "Editors and admins can manage post tags"
    ON public.post_tags
    FOR ALL
    TO authenticated
    USING (is_user_editor_or_admin())
    WITH CHECK (is_user_editor_or_admin());