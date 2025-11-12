/*
  # Add Localization Fields to Post Translations

  This migration adds fields to support cultural localization beyond basic translation.
  
  ## New Fields:
  1. localization_notes - Instructions for cultural adaptation
  2. localization_status - Review status for localized content
  3. cultural_adaptations - Record of cultural changes made
  4. locale_specific - Flag for locale-specific content vs general language
  
  ## Localization Workflow:
  - Content creators add localization notes during post creation
  - Translators review notes and adapt content culturally
  - Reviewers verify cultural appropriateness before publishing
*/

-- Add localization fields to post_translations table
DO $$
BEGIN
  -- Add localization_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'localization_notes'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN localization_notes text DEFAULT '';
  END IF;

  -- Add localization_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'localization_status'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN localization_status text DEFAULT 'not_reviewed';
  END IF;

  -- Add cultural_adaptations column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'cultural_adaptations'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN cultural_adaptations text DEFAULT '';
  END IF;

  -- Add locale_specific column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_translations' AND column_name = 'locale_specific'
  ) THEN
    ALTER TABLE post_translations ADD COLUMN locale_specific boolean DEFAULT false;
  END IF;
END $$;

-- Add constraint for localization_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_translations_localization_status_check'
  ) THEN
    ALTER TABLE post_translations ADD CONSTRAINT post_translations_localization_status_check 
    CHECK (localization_status IN ('not_reviewed', 'pending_review', 'reviewed', 'needs_rework'));
  END IF;
END $$;

-- Add localization fields to main posts table for source content
DO $$
BEGIN
  -- Add localization_notes to posts table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'localization_notes'
  ) THEN
    ALTER TABLE posts ADD COLUMN localization_notes text DEFAULT '';
  END IF;

  -- Add target_markets to posts table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'target_markets'
  ) THEN
    ALTER TABLE posts ADD COLUMN target_markets jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add adaptation_priority to posts table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'adaptation_priority'
  ) THEN
    ALTER TABLE posts ADD COLUMN adaptation_priority text DEFAULT 'medium';
  END IF;
END $$;

-- Add constraint for adaptation_priority values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_adaptation_priority_check'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_adaptation_priority_check 
    CHECK (adaptation_priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Create index for localization queries
CREATE INDEX IF NOT EXISTS idx_post_translations_localization_status 
ON post_translations(localization_status);

CREATE INDEX IF NOT EXISTS idx_post_translations_locale_specific 
ON post_translations(locale_specific);

-- Create index for target markets
CREATE INDEX IF NOT EXISTS idx_posts_target_markets 
ON posts USING gin(target_markets);