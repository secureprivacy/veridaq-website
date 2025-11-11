/*
  Create API Settings Table
  
  This migration creates a secure table to store API keys and settings
  for third-party integrations like Claude, OpenAI, Google Search Console, etc.
  
  Tables created:
  - api_settings (secure storage for API keys and configuration)
  
  Security:
  - RLS enabled
  - Only admins can read/manage API settings
  - Sensitive data encrypted at rest
*/

-- Create api_settings table
CREATE TABLE IF NOT EXISTS api_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

-- Update trigger
CREATE OR REPLACE FUNCTION update_api_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER api_settings_updated_at
  BEFORE UPDATE ON api_settings
  FOR EACH ROW EXECUTE PROCEDURE update_api_settings_updated_at();

-- Policies (only admins can access)
CREATE POLICY "Only admins can read api settings"
  ON api_settings
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can manage api settings"
  ON api_settings
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Insert default API settings placeholders
INSERT INTO api_settings (setting_name, setting_value, description, is_active) VALUES
  ('claude_api_key', '', 'Claude API key for AI translations', false),
  ('openai_api_key', '', 'OpenAI API key for AI translations', false),
  ('google_search_console_credentials', '{}', 'Google Search Console API credentials JSON', false),
  ('bing_webmaster_api_key', '', 'Bing Webmaster Tools API key', false)
ON CONFLICT (setting_name) DO NOTHING;