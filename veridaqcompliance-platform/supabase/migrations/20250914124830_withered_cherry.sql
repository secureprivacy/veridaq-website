/*
# Create Translation Idempotency Table

This migration creates a table to track translation operations and prevent
duplicate work through idempotency keys and concurrency management.

## What this creates:
1. New Tables
   - `translation_idempotency`
     - `id` (uuid, primary key)
     - `idem_key` (text, unique) - Format: "translate:{post_id}:{language_code}"
     - `status` (text) - 'in_progress', 'completed', 'failed'
     - `result_id` (uuid, optional) - References the created translation
     - `created_at` (timestamp)
     - `expires_at` (timestamp) - TTL for cleanup

2. Security
   - Enable RLS on `translation_idempotency` table
   - Add policies for authenticated users to manage their translation operations

3. Indexes
   - Unique index on `idem_key` for fast lookups
   - Index on `expires_at` for efficient cleanup operations
   - Index on `status` for filtering operations
*/

-- Create translation idempotency table
CREATE TABLE IF NOT EXISTS translation_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idem_key text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
  result_id uuid,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translation_idempotency_idem_key 
  ON translation_idempotency (idem_key);

CREATE INDEX IF NOT EXISTS idx_translation_idempotency_expires_at 
  ON translation_idempotency (expires_at);

CREATE INDEX IF NOT EXISTS idx_translation_idempotency_status 
  ON translation_idempotency (status);

-- Enable RLS
ALTER TABLE translation_idempotency ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can manage translation idempotency"
  ON translation_idempotency
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_translation_records()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM translation_idempotency 
  WHERE expires_at < now();
$$;

-- Create a trigger to periodically clean up expired records
-- This will run every time a new record is inserted
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_translations()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only run cleanup 10% of the time to avoid performance impact
  IF random() < 0.1 THEN
    PERFORM cleanup_expired_translation_records();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_expired_translations
  AFTER INSERT ON translation_idempotency
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_expired_translations();