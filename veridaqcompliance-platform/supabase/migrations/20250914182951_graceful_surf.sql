/*
# Remove Excerpt Columns from Blog System

This migration removes the excerpt columns from both posts and post_translations tables
as part of simplifying the blog content model while preserving translation functionality.

## What this removes:
1. excerpt column from posts table
2. excerpt column from post_translations table

## Impact:
- Simplifies content model to focus on title and main content
- Reduces complexity in content creation and translation workflows
- Maintains all other functionality including translations, SEO, and content management

## Safety:
- Uses IF EXISTS to prevent errors if columns are already removed
- Non-destructive for other table functionality
*/

-- Remove excerpt column from posts table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE public.posts DROP COLUMN excerpt;
  END IF;
END $$;

-- Remove excerpt column from post_translations table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE public.post_translations DROP COLUMN excerpt;
  END IF;
END $$;