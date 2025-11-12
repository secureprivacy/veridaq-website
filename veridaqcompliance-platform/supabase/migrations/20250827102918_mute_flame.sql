/*
  # API Configuration Setup

  Insert default API settings needed for blog automation features.
  These can be updated through the admin interface.
*/

-- Insert default API settings for blog automation
INSERT INTO api_settings (setting_name, setting_value, description, is_active) VALUES
  ('supabase_function_url', 'https://your-project.supabase.co', 'Base URL for Supabase Edge Functions', true),
  ('supabase_service_role_key', '', 'Service role key for internal API calls', false),
  ('site_base_url', 'https://veridaq.com', 'Base URL of the website for generating post URLs', true),
  ('default_translation_provider', 'claude', 'Default AI provider for translations (claude or openai)', true),
  ('claude_api_key', '', 'API key for Claude AI translation service', false),
  ('openai_api_key', '', 'API key for OpenAI translation service', false),
  ('google_search_console_credentials', '', 'Google Search Console API credentials (JSON)', false),
  ('bing_webmaster_api_key', '', 'Bing Webmaster Tools API key', false),
  ('auto_translate_on_publish', 'true', 'Automatically translate posts when published', true),
  ('auto_ping_search_engines', 'true', 'Automatically notify search engines of new content', true)
ON CONFLICT (setting_name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;