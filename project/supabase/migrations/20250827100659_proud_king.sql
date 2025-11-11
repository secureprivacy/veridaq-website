/*
  # Create Initial Admin User and Default Roles

  1. New Tables
    - Creates default roles (admin, editor, viewer)
    - Sets up initial admin user capabilities

  2. Security
    - Ensures proper role hierarchy
    - Creates foundational user management
*/

-- Create default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system administration access', '{"posts": ["create", "read", "update", "delete"], "translations": ["create", "read", "update", "delete"], "users": ["create", "read", "update", "delete"], "settings": ["create", "read", "update", "delete"]}'),
  ('editor', 'Content creation and management', '{"posts": ["create", "read", "update"], "translations": ["create", "read", "update"]}'),
  ('viewer', 'Read-only access', '{"posts": ["read"], "translations": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- Create function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
  user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get user ID from email
  SELECT au.id INTO user_id
  FROM auth.users au
  WHERE au.email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Assign admin role to user
  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES (user_id, admin_role_id, user_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To make someone an admin, run: SELECT make_user_admin('admin@veridaq.com');