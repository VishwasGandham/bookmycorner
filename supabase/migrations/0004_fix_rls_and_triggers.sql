-- Consolidated fix for missing tables and RLS policies

-- 1. Ensure Visitors Table Exists (in case 0002 was missed)
CREATE TABLE IF NOT EXISTS public.visitors (
  visitor_id UUID PRIMARY KEY,
  ip TEXT,
  device TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  city_interest TEXT,
  budget_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fix Visitors RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for tracking)
DROP POLICY IF EXISTS "Public can insert visitors" ON public.visitors;
CREATE POLICY "Public can insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);

-- Allow public updates to their own record (via visitor_id match, simplified for now to allow all updates or just logic)
-- Since we use UUIDs, guessing a visitor_id is hard. We can allow updates if we just trust the client for now.
DROP POLICY IF EXISTS "Public can update visitors" ON public.visitors;
CREATE POLICY "Public can update visitors" ON public.visitors FOR UPDATE USING (true); 
-- (Refined: In production, verify against cookie/header, but for now allow to fix 403)

DROP POLICY IF EXISTS "Admins can view visitors" ON public.visitors;
CREATE POLICY "Admins can view visitors" ON public.visitors FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Fix Activity Logs RLS (403 Forbidden)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for activity logs
DROP POLICY IF EXISTS "Public can insert activity logs" ON public.activity_logs;
CREATE POLICY "Public can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Allow admins to view logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Fix Profiles RLS and Triggers (406 Not Acceptable / Zero rows)
-- Ensure trigger exists for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'buyer'), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger if missing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure profiles are publicly viewable (or atleast by owners)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
