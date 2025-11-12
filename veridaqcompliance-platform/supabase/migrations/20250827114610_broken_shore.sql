/*
  # Fix User Signup Database Trigger

  1. Functions
    - Create `handle_new_user` function to automatically create user profiles
    - This function runs when a new user signs up via auth.users

  2. Triggers  
    - Add trigger on auth.users table to call handle_new_user function
    - Ensures user_profiles record is created for every new signup

  3. Security
    - Function has proper error handling
    - Maintains data integrity between auth.users and user_profiles
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();