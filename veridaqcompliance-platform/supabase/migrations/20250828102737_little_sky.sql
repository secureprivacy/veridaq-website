/*
  # Auto-assign editor role to new users

  1. Changes
    - Add trigger to automatically assign "editor" role to new users
    - Ensure "editor" role exists in the database
    - Create function to handle role assignment

  2. Security
    - Function runs with security definer privileges
    - Only assigns editor role, not admin
*/

-- Ensure editor role exists
INSERT INTO roles (name, description, permissions) 
VALUES ('editor', 'Content editor with blog management access', '{"blog": {"read": true, "write": true}}')
ON CONFLICT (name) DO NOTHING;

-- Function to assign editor role to new users
CREATE OR REPLACE FUNCTION assign_editor_role_to_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role_id)
  SELECT 
    NEW.id,
    r.id
  FROM roles r
  WHERE r.name = 'editor';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically assign editor role when user profile is created
CREATE OR REPLACE TRIGGER trigger_assign_editor_role
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_editor_role_to_new_user();