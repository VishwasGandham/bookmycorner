-- increment_leads_count RPC function (atomic counter)
CREATE OR REPLACE FUNCTION increment_leads_count(property_id_input UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE properties
    SET leads_count = leads_count + 1
    WHERE id = property_id_input;
END;
$$;
