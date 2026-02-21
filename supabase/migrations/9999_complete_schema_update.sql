-- MASTER MIGRATION SCRIPT
-- Runs safely even if parts have already been applied.
-- Includes changes from 0002, 0003, and 0004.

-- 1. ENHANCE PROPERTIES TABLE (from 0002)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS length NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS width NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS facing TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS corner_plot BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS road_width_front NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS road_width_back NUMERIC;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS layout_approval_status TEXT DEFAULT 'pending';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS registration_available BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS documents_available BOOLEAN DEFAULT false;
-- For computed columns, we drop and recreate to be safe or use IF NOT EXISTS logic which is harder for generated. 
-- We'll try to add it ONLY if it doesn't exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'price_per_sqft') THEN
        ALTER TABLE public.properties ADD COLUMN price_per_sqft NUMERIC GENERATED ALWAYS AS (price / NULLIF(area, 0)) STORED;
    END IF;
END $$;

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT true;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS leads_count INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. UPDATE PROPERTY STATUS ENUM (from 0003)
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check 
CHECK (status IN ('available', 'sold', 'pending', 'rejected'));

-- 3. CREATE VISITORS TABLE (from 0002/0004)
CREATE TABLE IF NOT EXISTS public.visitors (
  visitor_id UUID PRIMARY KEY,
  ip TEXT,
  device TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  city_interest TEXT,
  budget_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. UPDATE ACTIVITY LOGS (from 0002)
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS plot_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;

-- 5. RLS POLICIES & PERMISSIONS (Consolidated & Fixed from 0004)

-- Visitors RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert visitors" ON public.visitors;
DROP POLICY IF EXISTS "Public can insert visitors" ON public.visitors;
CREATE POLICY "Public can insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view visitors" ON public.visitors;
CREATE POLICY "Admins can view visitors" ON public.visitors FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Visitors can update own record" ON public.visitors;
DROP POLICY IF EXISTS "Public can update visitors" ON public.visitors;
CREATE POLICY "Public can update visitors" ON public.visitors FOR UPDATE USING (true);

-- Activity Logs RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert activity logs" ON public.activity_logs;
CREATE POLICY "Public can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles RLS & Triggers
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Trigger for New User Creation (Fixes 406 error issues)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'buyer'), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. STORAGE (Optional but good to have)
-- Cannot easily create buckets via SQL in all Supabase versions, but if the extensions are enabled:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT DO NOTHING;
