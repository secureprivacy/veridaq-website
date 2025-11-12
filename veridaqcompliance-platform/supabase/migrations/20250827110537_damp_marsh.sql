/*
  # Add Claude API Key Configuration

  1. New Settings
    - Add Claude API key for AI translation services
    - Set as active for immediate use
  2. Security
    - API key stored securely in api_settings table
    - Only admins can access and modify
*/

INSERT INTO api_settings (setting_name, setting_value, description, is_active)
VALUES (
  'claude_api_key',
  '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',
  'Anthropic Claude API key for AI-powered blog post translations. Used by the translate-post Edge Function.',
  true
) ON CONFLICT (setting_name) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  is_active = EXCLUDED.is_active,
  updated_at = now();