/*
  # Create Roles and User Roles System

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - 'admin' or 'editor'
      - `description` (text)
      - `permissions` (jsonb) - stores role permissions
      - `created_at` (timestamp)
    
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role_id` (uuid, references roles)
      - `assigned_by` (uuid, references auth.users)
      - `assigned_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Only admins can manage roles and user assignments
    - All authenticated users can read roles for UI display

  3. Initial Data
    - Insert default 'admin' and 'editor' roles with permissions
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  permissions jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles (for UI dropdowns, etc.)
CREATE POLICY "Everyone can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage roles
CREATE POLICY "Only admins can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Everyone can read user roles (to check permissions)
CREATE POLICY "Everyone can read user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can assign/remove roles
CREATE POLICY "Only admins can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system access including user management', '{"posts": ["create", "read", "update", "delete", "publish"], "users": ["create", "read", "update", "delete"], "roles": ["create", "read", "update", "delete"], "analytics": ["read"]}'),
  ('editor', 'Can create, edit and publish blog posts', '{"posts": ["create", "read", "update", "publish"], "analytics": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN get_user_role(user_uuid) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN get_user_role(user_uuid) IN ('admin', 'editor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;