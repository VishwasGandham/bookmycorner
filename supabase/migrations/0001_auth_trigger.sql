-- 1. Enhance Profiles Table
-- Adding email for easier queries (so we don't always need to join auth.users)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create Trigger Function
-- This runs securely on the server whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'), -- Default to buyer
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
-- Fires after a row is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Security Cleanup
-- Now that the server handles inserts, we can REMOVE permissions for clients to insert into profiles
-- This ensures only the Trigger can create profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
