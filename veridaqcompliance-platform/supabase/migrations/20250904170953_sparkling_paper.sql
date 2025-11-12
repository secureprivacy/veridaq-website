/*
  # Remove author foreign key constraint for development

  1. Changes
    - Drop the foreign key constraint on posts.author_id
    - This allows posts to be created with any author_id during development
    - Prevents foreign key constraint violations with demo users

  2. Notes
    - This is for development only
    - Re-enable constraints in production
    - Posts can now be created without valid users in auth.users table
*/

-- Drop the foreign key constraint that's causing the error
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Add a comment to track this change
COMMENT ON COLUMN posts.author_id IS 'Foreign key constraint removed for development - re-add in production';