/*
# Add excerpt column to post_translations table

This migration adds the missing 'excerpt' column to the post_translations table.
The translation function expects this column to exist but it's missing from the current schema.

## What this adds:
1. New Tables
   - None (modifying existing table)

2. Schema Changes
   - Add 'excerpt' column to post_translations table
   - Set default value to empty string for consistency
   - Make it NOT NULL with default to maintain data integrity

3. Security
   - No RLS changes needed (inherits existing policies)
*/

-- Add excerpt column to post_translations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN excerpt text DEFAULT '' NOT NULL;
  END IF;
END $$;

-- Update any existing translations to have empty excerpt if needed
UPDATE post_translations 
SET excerpt = '' 
WHERE excerpt IS NULL;