/*
  # Assign Admin Role to All Existing Users

  1. Role Management
    - Creates 'admin' and 'editor' roles if they don't exist
    - Sets up proper permissions for each role
  
  2. User Role Assignment
    - Assigns admin role to all existing users
    - Upgrades any existing editors to admin
    - Handles conflicts gracefully
*/

-- Create admin role if it doesn't exist
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'admin',
  'Full administrative access to the platform',
  '{
    "blog": {"create": true, "read": true, "update": true, "delete": true},
    "users": {"create": true, "read": true, "update": true, "delete": true},
    "settings": {"read": true, "update": true},
    "translations": {"create": true, "read": true, "update": true, "delete": true}
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Create editor role if it doesn't exist  
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'editor',
  'Content creation and management access',
  '{
    "blog": {"create": true, "read": true, "update": true, "delete": false},
    "users": {"create": false, "read": true, "update": false, "delete": false},
    "settings": {"read": false, "update": false},
    "translations": {"create": true, "read": true, "update": true, "delete": false}
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Assign admin role to all existing users who don't have any roles yet
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 
  up.id as user_id,
  r.id as role_id,
  up.id as assigned_by
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = up.id
  )
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Upgrade any existing editors to admin
INSERT INTO public.user_roles (user_id, role_id, assigned_by)
SELECT 
  ur.user_id,
  admin_role.id as role_id,
  ur.user_id as assigned_by
FROM public.user_roles ur
JOIN public.roles editor_role ON ur.role_id = editor_role.id
JOIN public.roles admin_role ON admin_role.name = 'admin'
WHERE editor_role.name = 'editor'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2
    JOIN public.roles r2 ON ur2.role_id = r2.id
    WHERE ur2.user_id = ur.user_id 
    AND r2.name = 'admin'
  )
ON CONFLICT (user_id, role_id) DO NOTHING;