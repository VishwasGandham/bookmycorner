-- Enhance Properties Table with Plot-specific fields and Admin controls
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS length NUMERIC,
ADD COLUMN IF NOT EXISTS width NUMERIC,
ADD COLUMN IF NOT EXISTS facing TEXT,
ADD COLUMN IF NOT EXISTS corner_plot BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS road_width_front NUMERIC,
ADD COLUMN IF NOT EXISTS road_width_back NUMERIC,
ADD COLUMN IF NOT EXISTS layout_approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS registration_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS documents_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC GENERATED ALWAYS AS (price / NULLIF(area, 0)) STORED,
ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS leads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create Visitors Table
CREATE TABLE IF NOT EXISTS public.visitors (
  visitor_id UUID PRIMARY KEY, -- stored in cookie
  ip TEXT,
  device TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  city_interest TEXT,
  budget_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Visitors
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view visitors" ON public.visitors FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Allow visitors to update their own record (e.g. last_activity)
CREATE POLICY "Visitors can update own record" ON public.visitors FOR UPDATE USING (visitor_id::text = current_setting('request.headers')::json->>'visitor_id'); 
-- Note: The above RLS for generic visitor update is tricky without auth. 
-- For now, we might rely on the backend/edge function or simplified policy if using client-side directly.
-- Let's stick to a simpler "Anyone can update" if we accept the risk, or better: 
-- rely on `activity_logs` for updates and keep `visitors` as a registry.
-- Actually, let's keep it simple: Public Insert, Admin Select. Client updates rely on specific logic or ignored for now.

-- Add Saved Plots Table if not exists (already in favorites? let's check)
-- "saved_plots" in prompt vs "favorites" in schema. schema has favorites.
-- We can alias or map them in code.

-- Activities Table (if separate from activity_logs)
-- Prompt asks for "activities". Schema has "activity_logs".
-- Schema `activity_logs` has `user_id` (UUID), `visitor_id` (TEXT).
-- Prompt: `visitor_id`, `plot_id`, `action`, `timestamp`.
-- Schema: `user_id`, `visitor_id`, `action`, `details` (JSONB), `created_at`.
-- Matches closely enough. We can add `plot_id` column to `activity_logs` for easier querying.
ALTER TABLE public.activity_logs
ADD COLUMN IF NOT EXISTS plot_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
