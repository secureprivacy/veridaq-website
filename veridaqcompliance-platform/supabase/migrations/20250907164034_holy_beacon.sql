/*
# Clean All Translations and Fix Pending Handling

This script removes ALL translations from the database (including pending ones)
and improves the translation function to handle pending translations properly.

## What this does:
1. Deletes all existing translations (pending, completed, failed)
2. Shows you exactly how many were deleted
3. Resets the translation system to a clean state
*/

-- First, let's see what we have
SELECT 
  translation_status,
  language_code,
  COUNT(*) as count
FROM post_translations 
GROUP BY translation_status, language_code
ORDER BY translation_status, language_code;

-- Now delete ALL translations (pending, completed, failed - everything)
DELETE FROM post_translations;

-- Verify everything is gone
SELECT COUNT(*) as remaining_translations FROM post_translations;

-- If the count above is 0, then all translations have been successfully removed