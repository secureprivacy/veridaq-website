/*
  # Create Safe Authentication Functions

  1. New Functions
     - `get_user_role_names()` - Returns current user's role names safely
     - `is_user_admin()` - Checks if current user is admin (security definer)
     - `is_user_editor_or_admin()` - Checks if current user is editor or admin
     
  2. Security
     - All functions use SECURITY DEFINER to bypass RLS during execution
     - Functions query auth.uid() directly to get current user
     - No recursive policy dependencies
*/

-- Create a security definer function to get user roles safely
CREATE OR REPLACE FUNCTION get_user_role_names()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    role_names TEXT[];
BEGIN
    SELECT ARRAY_AGG(r.name)
    INTO role_names
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid();
    
    RETURN COALESCE(role_names, ARRAY[]::TEXT[]);
END;
$$;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN 'admin' = ANY(get_user_role_names());
END;
$$;

-- Create a security definer function to check if user is editor or admin
CREATE OR REPLACE FUNCTION is_user_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN 'admin' = ANY(get_user_role_names()) OR 'editor' = ANY(get_user_role_names());
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role_names() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_editor_or_admin() TO authenticated;