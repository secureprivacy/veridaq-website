/*
# Add focus_keyword column to posts table

This migration adds the missing 'focus_keyword' column to the posts table
to resolve the Supabase request error.

## Changes:
1. Add focus_keyword column to posts table
*/

-- Add the missing focus_keyword column to the posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'focus_keyword'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN focus_keyword text DEFAULT '';
  END IF;
END $$;