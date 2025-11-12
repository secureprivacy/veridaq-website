/*
# Seed Default API Settings

This migration creates the default API settings entries if they don't exist.
These settings control AI translations, search engine notifications, and other automation features.

## What this creates:
1. Default API settings entries for all required services
2. Proper configuration structure for the CMS
3. Safe defaults that can be updated through the admin interface
*/

-- Insert default API settings if they don't exist
INSERT INTO public.api_settings (setting_name, setting_value, description, is_active)
SELECT * FROM (VALUES
  ('claude_api_key', '', 'Claude API key for AI-powered blog post translations. Used by the translate-post Edge Function.', false),
  ('openai_api_key', '', 'OpenAI API key for ChatGPT translations and content analysis.', false),
  ('google_search_console_credentials', '', 'Google Search Console API credentials for automatic content indexing.', false),
  ('bing_webmaster_api_key', '', 'Bing Webmaster Tools API key for search engine notifications.', false),
  ('auto_translate_on_publish', 'true', 'Automatically translate posts to all supported languages when published.', true),
  ('auto_ping_search_engines', 'true', 'Automatically notify Google and Bing when new content is published.', true)
) AS new_settings(setting_name, setting_value, description, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.api_settings 
  WHERE api_settings.setting_name = new_settings.setting_name
);