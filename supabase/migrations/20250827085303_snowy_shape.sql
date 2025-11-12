/*
  Create User Profiles Table
  
  Creates user profiles table that extends Supabase auth.users
  with additional profile information like full name and avatar.
  
  Tables:
  - user_profiles: Extended user profile information
  
  Security:
  - Enable RLS on user_profiles table
  - Users can read and update their own profile
  - Authenticated users can read all profiles for collaboration
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();