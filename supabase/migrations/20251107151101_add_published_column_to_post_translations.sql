/*
  # Add published column to post_translations

  1. Changes
    - Add `published` column to `post_translations` table
    - Set default value to `true` for new translations
    - Allow null values for flexibility

  2. Purpose
    - Enable tracking of translation publication status
    - Support publishing/unpublishing individual translations
    - Default to published for completed translations
*/

-- Add published column to post_translations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'published'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN published boolean DEFAULT true;
  END IF;
END $$;