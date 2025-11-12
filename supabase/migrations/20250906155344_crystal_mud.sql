/*
  # Add published column to post_translations

  1. Changes
    - Add `published` column to `post_translations` table
    - Set default value to `false` for existing records
    - Allow null values for flexibility

  2. Purpose
    - Enable tracking of translation publication status
    - Support publishing/unpublishing individual translations
    - Fix application error for missing column
*/

-- Add published column to post_translations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'published'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN published boolean DEFAULT false;
  END IF;
END $$;