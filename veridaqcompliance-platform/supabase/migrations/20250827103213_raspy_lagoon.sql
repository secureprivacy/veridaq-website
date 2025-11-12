/*
  # Create automation triggers for blog system

  1. Database Functions
    - `notify_translation_needed` - Triggers translation when post is published
    - `notify_search_engines` - Triggers search engine ping when post is updated
    - `auto_generate_slug` - Automatically generates slugs from titles

  2. Triggers
    - Auto-translation on post publish
    - Search engine notification on content changes
    - Slug generation on insert/update
*/

-- Function to trigger translation when post is published
CREATE OR REPLACE FUNCTION notify_translation_needed()
RETURNS trigger AS $$
BEGIN
  -- Only trigger translation if status changed to published and it's a new publish
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Make async call to edge function
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/translate-post',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object('post_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify search engines when content changes
CREATE OR REPLACE FUNCTION notify_search_engines()
RETURNS trigger AS $$
BEGIN
  -- Only notify if post is published
  IF NEW.status = 'published' THEN
    -- Make async call to edge function
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/ping-search-consoles',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object('post_id', NEW.id, 'post_slug', NEW.slug)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-generate slugs
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS trigger AS $$
BEGIN
  -- Generate slug if not provided or if title changed
  IF NEW.slug IS NULL OR NEW.slug = '' OR (OLD IS NOT NULL AND NEW.title != OLD.title AND NEW.slug = OLD.slug) THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    
    -- Ensure slug uniqueness by appending number if needed
    WHILE EXISTS (SELECT 1 FROM posts WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_translation ON posts;
CREATE TRIGGER trigger_notify_translation
  AFTER UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_translation_needed();

DROP TRIGGER IF EXISTS trigger_notify_search_engines ON posts;
CREATE TRIGGER trigger_notify_search_engines
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_search_engines();

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON posts;
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- Similar triggers for post_translations
DROP TRIGGER IF EXISTS trigger_notify_search_engines_translations ON post_translations;
CREATE TRIGGER trigger_notify_search_engines_translations
  AFTER INSERT OR UPDATE ON post_translations
  FOR EACH ROW
  EXECUTE FUNCTION notify_search_engines();

-- Auto-generate slug for translations too
CREATE OR REPLACE FUNCTION auto_generate_translation_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (OLD IS NOT NULL AND NEW.title != OLD.title AND NEW.slug = OLD.slug) THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    
    -- Ensure slug uniqueness within the same language
    WHILE EXISTS (
      SELECT 1 FROM post_translations 
      WHERE slug = NEW.slug 
      AND language_code = NEW.language_code 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_translation_slug ON post_translations;
CREATE TRIGGER trigger_auto_generate_translation_slug
  BEFORE INSERT OR UPDATE ON post_translations
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_translation_slug();