-- Create an RPC function for atomic view counter increment
CREATE OR REPLACE FUNCTION public.increment_views_count(property_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.properties
  SET views_count = views_count + 1
  WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
