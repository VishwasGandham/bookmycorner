-- 1. Add phone column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update handle_new_user trigger to capture phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'), 
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix Visitors RLS - Add SELECT policy (Fixes 403 on Upsert)
-- Upsert requires SELECT permission to check for existing rows
DROP POLICY IF EXISTS "Public can view visitors" ON public.visitors;
CREATE POLICY "Public can view visitors" ON public.visitors FOR SELECT USING (true);


-- 4. Ensure Properties default to 'pending'
ALTER TABLE public.properties ALTER COLUMN status SET DEFAULT 'pending';

-- 5. Add RLS for Admin to update ANY profile (e.g. to deactivate users)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
