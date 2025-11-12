# 🚨 MANUAL DATABASE FIX REQUIRED

The application is still getting **400 Bad Request** errors when trying to update posts. This means the database RLS policies haven't been fixed yet.

## ⚠️ **CRITICAL: You must manually run this SQL in Supabase**

1. **Open Supabase Dashboard** → https://supabase.com
2. **Go to SQL Editor**
3. **Copy and run this EXACT SQL**:

```sql
-- Fix RLS policy for post updates
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
```

## 🔍 **Why this is needed:**

The current RLS policy only allows the original post author to update their posts. But in a CMS, **editors should be able to manage any post**, not just their own.

## ✅ **After running the SQL:**

- Editors will be able to publish/unpublish any post
- The "Failed to update post status" error will be resolved
- The CMS will work as expected

**Please run this SQL script in Supabase SQL Editor to fix the issue!**