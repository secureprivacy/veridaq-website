/*
  # Add excerpt column to posts table

  1. Changes
    - Add `excerpt` column to `posts` table
    - Set as text type with empty string default
    - Make it NOT NULL for data consistency

  2. Notes
    - This resolves the PGRST204 error where the application expects an excerpt column
    - Existing posts will have empty excerpts by default
    - The post_translations table already has this column
*/

-- Add excerpt column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt text NOT NULL DEFAULT '';