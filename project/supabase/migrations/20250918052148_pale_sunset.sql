/*
# Setup Magic Link Authentication with Email Whitelist

This migration sets up secure magic link authentication with the following features:
1. Email whitelist for authorized users only
2. Rate limiting for magic link requests
3. Audit logging for authentication attempts
4. Proper RLS policies for CMS access

## Security Features:
- Only dan@secureprivacy.ai and pal.schakonat@hyperisland.se can access
- Magic links expire in 15 minutes
- Rate limiting: max 3 attempts per hour per email
- All authentication attempts are logged
- Secure session management

## Tables Created:
- `auth_whitelist` - Authorized email addresses
- `auth_attempts` - Authentication attempt logging
- `auth_rate_limits` - Rate limiting tracking
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth whitelist table
CREATE TABLE IF NOT EXISTS auth_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  notes text DEFAULT ''
);

-- Create auth attempts logging table
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('magic_link_request', 'magic_link_verify', 'session_refresh')),
  success boolean NOT NULL,
  ip_address inet,
  user_agent text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  last_attempt timestamptz DEFAULT now(),
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Insert authorized email addresses
INSERT INTO auth_whitelist (email, role, notes) VALUES 
  ('dan@secureprivacy.ai', 'admin', 'Primary administrator'),
  ('pal.schakonat@hyperisland.se', 'admin', 'Secondary administrator')
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  role = EXCLUDED.role,
  notes = EXCLUDED.notes;

-- Enable RLS on all tables
ALTER TABLE auth_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auth_whitelist
CREATE POLICY "Service role can manage whitelist"
  ON auth_whitelist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read whitelist"
  ON auth_whitelist
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for auth_attempts
CREATE POLICY "Service role can manage auth attempts"
  ON auth_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own auth attempts"
  ON auth_attempts
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- RLS Policies for auth_rate_limits
CREATE POLICY "Service role can manage rate limits"
  ON auth_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to check if email is whitelisted
CREATE OR REPLACE FUNCTION is_email_whitelisted(email_address text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth_whitelist 
    WHERE email = email_address 
    AND is_active = true
  );
$$;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(email_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rate_limit_record auth_rate_limits%ROWTYPE;
  current_time timestamptz := now();
  window_duration interval := '1 hour';
  max_attempts integer := 3;
  block_duration interval := '1 hour';
BEGIN
  -- Get existing rate limit record
  SELECT * INTO rate_limit_record
  FROM auth_rate_limits
  WHERE email = email_address
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no record exists, create one
  IF rate_limit_record IS NULL THEN
    INSERT INTO auth_rate_limits (email, attempt_count, window_start, last_attempt)
    VALUES (email_address, 1, current_time, current_time);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', max_attempts - 1,
      'reset_time', current_time + window_duration
    );
  END IF;

  -- Check if currently blocked
  IF rate_limit_record.is_blocked AND rate_limit_record.blocked_until > current_time THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'blocked',
      'blocked_until', rate_limit_record.blocked_until,
      'attempts_remaining', 0
    );
  END IF;

  -- Check if window has expired
  IF current_time > (rate_limit_record.window_start + window_duration) THEN
    -- Reset the window
    UPDATE auth_rate_limits
    SET 
      attempt_count = 1,
      window_start = current_time,
      last_attempt = current_time,
      is_blocked = false,
      blocked_until = null
    WHERE id = rate_limit_record.id;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', max_attempts - 1,
      'reset_time', current_time + window_duration
    );
  END IF;

  -- Check if max attempts reached
  IF rate_limit_record.attempt_count >= max_attempts THEN
    -- Block the email
    UPDATE auth_rate_limits
    SET 
      is_blocked = true,
      blocked_until = current_time + block_duration,
      last_attempt = current_time
    WHERE id = rate_limit_record.id;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'blocked_until', current_time + block_duration,
      'attempts_remaining', 0
    );
  END IF;

  -- Increment attempt count
  UPDATE auth_rate_limits
  SET 
    attempt_count = attempt_count + 1,
    last_attempt = current_time
  WHERE id = rate_limit_record.id;

  RETURN jsonb_build_object(
    'allowed', true,
    'attempts_remaining', max_attempts - rate_limit_record.attempt_count,
    'reset_time', rate_limit_record.window_start + window_duration
  );
END;
$$;

-- Create function to log authentication attempts
CREATE OR REPLACE FUNCTION log_auth_attempt(
  email_address text,
  attempt_type text,
  success boolean,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO auth_attempts (
    email, 
    attempt_type, 
    success, 
    ip_address, 
    user_agent, 
    error_message
  )
  VALUES (
    email_address, 
    attempt_type, 
    success, 
    ip_address, 
    user_agent, 
    error_message
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to validate magic link request
CREATE OR REPLACE FUNCTION validate_magic_link_request(email_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  whitelist_check boolean;
  rate_limit_result jsonb;
BEGIN
  -- Check if email is whitelisted
  SELECT is_email_whitelisted(email_address) INTO whitelist_check;
  
  IF NOT whitelist_check THEN
    -- Log unauthorized attempt
    PERFORM log_auth_attempt(
      email_address, 
      'magic_link_request', 
      false, 
      NULL, 
      NULL, 
      'Email not in whitelist'
    );
    
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'unauthorized_email',
      'message', 'This email address is not authorized to access the CMS'
    );
  END IF;

  -- Check rate limits
  SELECT check_rate_limit(email_address) INTO rate_limit_result;
  
  IF NOT (rate_limit_result ->> 'allowed')::boolean THEN
    -- Log rate limited attempt
    PERFORM log_auth_attempt(
      email_address, 
      'magic_link_request', 
      false, 
      NULL, 
      NULL, 
      'Rate limit exceeded'
    );
    
    RETURN rate_limit_result;
  END IF;

  -- Log successful validation
  PERFORM log_auth_attempt(
    email_address, 
    'magic_link_request', 
    true, 
    NULL, 
    NULL, 
    NULL
  );

  RETURN jsonb_build_object(
    'allowed', true,
    'message', 'Magic link request validated successfully'
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_email_whitelisted(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_rate_limit(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_auth_attempt(text, text, boolean, inet, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION validate_magic_link_request(text) TO authenticated, anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_whitelist_email ON auth_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_auth_whitelist_active ON auth_whitelist(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created_at ON auth_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_email ON auth_rate_limits(email);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked_until ON auth_rate_limits(blocked_until);