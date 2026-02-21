-- Function to get popular areas based on number of active listings
CREATE OR REPLACE FUNCTION get_popular_areas()
RETURNS TABLE (area TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (likely admin) to ensure it can access data
AS $$
BEGIN
  RETURN QUERY
  SELECT location as area, count(*) as count
  FROM properties
  WHERE status = 'available'
  GROUP BY location
  ORDER BY count DESC
  LIMIT 8;
END;
$$;
