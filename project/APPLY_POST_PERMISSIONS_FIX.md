# Apply Post Update Permissions Fix

The migration file was created but needs to be manually applied to fix the "Failed to update post status" error.

## Step 1: Go to Supabase SQL Editor

1. Open your Supabase dashboard at https://supabase.com
2. Navigate to your project
3. Go to **SQL Editor** in the sidebar

## Step 2: Run the Permission Fix

Copy and paste this SQL into the SQL Editor and click **RUN**:

```sql
/*
# Fix Post Update Permissions

This script fixes the RLS policy that prevents editors from updating posts.
The issue is that only post authors can update their own posts, but editors should be able to manage any post.

## What this fixes:
1. Removes the restrictive author-only update policy
2. Adds a new policy allowing editors to update any post
3. Maintains security by requiring editor/admin privileges
*/

-- Drop the restrictive policy that only allows authors to update their own posts
DROP POLICY IF EXISTS "Authors can update own posts, admins can update any" ON public.posts;

-- Create a new policy that allows editors and admins to update any post
CREATE POLICY "Editors and admins can update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.is_editor_or_admin())
  WITH CHECK (auth.is_editor_or_admin());

-- Also ensure the insert policy allows editors to create posts
DROP POLICY IF EXISTS "Editors can create posts" ON public.posts;

CREATE POLICY "Editors can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_editor_or_admin() AND author_id = auth.uid());
```

## Step 3: Verify the Fix

After running the SQL:

1. Go back to your CMS dashboard
2. Try to publish/unpublish a post
3. The "Failed to update post status" error should now be resolved

## What Changed

- **Before**: Only post authors could update their own posts
- **After**: Any user with editor or admin role can update any post
- **Security**: Still requires proper authentication and role-based permissions

Run this SQL script and the post workflow should work correctly!