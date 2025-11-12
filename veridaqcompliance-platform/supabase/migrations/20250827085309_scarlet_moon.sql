/*
  Create Roles and Permissions System
  
  Creates a role-based access control system for blog management.
  Defines roles (admin, editor) and links users to roles.
  
  Tables:
  - roles: Define available roles with permissions
  - user_roles: Link users to their assigned roles
  
  Security:
  - Enable RLS on all tables
  - Only admins can manage roles and user assignments
  - Users can view their own role information
*/

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL CHECK (name IN ('admin', 'editor')),
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Full access to all blog management features', '{"manage_users": true, "manage_posts": true, "manage_settings": true}'),
('editor', 'Can create, edit and publish blog posts', '{"manage_posts": true, "view_analytics": true}')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies for roles
CREATE POLICY "Authenticated users can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles"
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

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(user_id uuid, role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_has_role.user_id AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;