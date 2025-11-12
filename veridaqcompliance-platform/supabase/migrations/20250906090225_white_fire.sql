/*
  # Remove pg_net dependencies for development

  This migration removes database functions and triggers that depend on the pg_net extension,
  which is causing the "schema net does not exist" error.

  1. Functions Removed
    - notify_search_engines (uses net.http_post)
    - notify_translation_needed (uses net.http_post)
  
  2. Triggers Removed
    - trigger_notify_search_engines
    - trigger_notify_search_engines_translations
    - trigger_notify_translation
  
  3. Replacement Functions
    - Creates no-op versions that don't use network calls
*/

-- Drop triggers that use pg_net functions
DROP TRIGGER IF EXISTS trigger_notify_search_engines ON posts;
DROP TRIGGER IF EXISTS trigger_notify_search_engines_translations ON post_translations;
DROP TRIGGER IF EXISTS trigger_notify_translation ON posts;

-- Drop functions that use pg_net
DROP FUNCTION IF EXISTS notify_search_engines();
DROP FUNCTION IF EXISTS notify_translation_needed();

-- Create no-op replacement functions for development
CREATE OR REPLACE FUNCTION notify_search_engines()
RETURNS trigger AS $$
BEGIN
  -- No-op function for development (removes pg_net dependency)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_translation_needed()
RETURNS trigger AS $$
BEGIN
  -- No-op function for development (removes pg_net dependency)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers with no-op functions
CREATE TRIGGER trigger_notify_search_engines
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_search_engines();

CREATE TRIGGER trigger_notify_search_engines_translations
  AFTER INSERT OR UPDATE ON post_translations
  FOR EACH ROW
  EXECUTE FUNCTION notify_search_engines();

CREATE TRIGGER trigger_notify_translation
  AFTER UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_translation_needed();