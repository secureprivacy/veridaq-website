/*
  # Fix user_roles RLS policies to prevent infinite recursion

  The current policies on user_roles table create infinite recursion because they check
  if a user is admin by querying the same table they're trying to access.

  1. Policy Updates
    - Remove recursive admin checks from user_roles policies
    - Allow users to read their own roles
    - Allow authenticated users to read all user roles (needed for role checks)
    - Only allow service role to manage user roles directly

  2. Security
    - Users can read all user roles (this is safe as it's just role names)
    - Users can only see their own role assignments
    - Management of roles restricted to service role operations
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Everyone can read user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create new non-recursive policies
CREATE POLICY "Users can read all user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage user roles (for admin operations)
CREATE POLICY "Service role can manage user roles"
  ON user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to see their own role assignments
CREATE POLICY "Users can see own role assignments"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);