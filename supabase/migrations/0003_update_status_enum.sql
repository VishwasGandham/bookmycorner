-- Add 'rejected' to the allowed status values
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check 
CHECK (status IN ('available', 'sold', 'pending', 'rejected'));
