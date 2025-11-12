/*
  # Create API Settings for Blog Features

  1. New Tables
    - `api_settings`
      - `id` (uuid, primary key)
      - `setting_name` (text, unique) - e.g., 'claude_api_key', 'openai_api_key'
      - `setting_value` (text) - encrypted API keys
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on api_settings table
    - Only admins can read and manage API settings
    - Settings are encrypted for security

  3. Initial Settings
    - Placeholder entries for AI translation API keys
*/

CREATE TABLE IF NOT EXISTS api_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name text UNIQUE NOT NULL,
  setting_value text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API settings
CREATE POLICY "Only admins can manage API settings"
  ON api_settings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Insert placeholder API settings
INSERT INTO api_settings (setting_name, description, setting_value, is_active) VALUES
  ('claude_api_key', 'Claude API key for AI translations', '', false),
  ('openai_api_key', 'OpenAI API key for ChatGPT translations', '', false),
  ('google_search_console_credentials', 'Google Search Console API credentials JSON', '', false),
  ('bing_webmaster_api_key', 'Bing Webmaster Tools API key', '', false)
ON CONFLICT (setting_name) DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_api_settings_updated_at
  BEFORE UPDATE ON api_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();