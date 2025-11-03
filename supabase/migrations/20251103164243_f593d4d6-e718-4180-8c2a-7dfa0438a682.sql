-- Fix RLS policies to use profiles table instead of auth.users

-- Drop and recreate policies for roadmaps
DROP POLICY IF EXISTS "Users can view their own or shared roadmaps" ON roadmaps;

CREATE POLICY "Users can view their own or shared roadmaps"
ON roadmaps FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares
    WHERE roadmap_shares.roadmap_id = roadmaps.id
    AND (
      roadmap_shares.shared_with_user_id = auth.uid()
      OR roadmap_shares.shared_with_email = (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Drop and recreate policies for deliveries
DROP POLICY IF EXISTS "Users can view their own or shared deliveries" ON deliveries;

CREATE POLICY "Users can view their own or shared deliveries"
ON deliveries FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = deliveries.roadmap_id
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can modify shared deliveries" ON deliveries;

CREATE POLICY "Editors can modify shared deliveries"
ON deliveries FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = deliveries.roadmap_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can create shared deliveries" ON deliveries;

CREATE POLICY "Editors can create shared deliveries"
ON deliveries FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = deliveries.roadmap_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can delete shared deliveries" ON deliveries;

CREATE POLICY "Editors can delete shared deliveries"
ON deliveries FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = deliveries.roadmap_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

-- Drop and recreate policies for sub_deliveries
DROP POLICY IF EXISTS "Users can view their own or shared sub_deliveries" ON sub_deliveries;

CREATE POLICY "Users can view their own or shared sub_deliveries"
ON sub_deliveries FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    JOIN deliveries d ON d.roadmap_id = rs.roadmap_id
    WHERE d.id = sub_deliveries.delivery_id
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can modify shared sub_deliveries" ON sub_deliveries;

CREATE POLICY "Editors can modify shared sub_deliveries"
ON sub_deliveries FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    JOIN deliveries d ON d.roadmap_id = rs.roadmap_id
    WHERE d.id = sub_deliveries.delivery_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can create shared sub_deliveries" ON sub_deliveries;

CREATE POLICY "Editors can create shared sub_deliveries"
ON sub_deliveries FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    JOIN deliveries d ON d.roadmap_id = rs.roadmap_id
    WHERE d.id = sub_deliveries.delivery_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can delete shared sub_deliveries" ON sub_deliveries;

CREATE POLICY "Editors can delete shared sub_deliveries"
ON sub_deliveries FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    JOIN deliveries d ON d.roadmap_id = rs.roadmap_id
    WHERE d.id = sub_deliveries.delivery_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

-- Drop and recreate policies for milestones
DROP POLICY IF EXISTS "Users can view their own or shared milestones" ON milestones;

CREATE POLICY "Users can view their own or shared milestones"
ON milestones FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = milestones.roadmap_id
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can modify shared milestones" ON milestones;

CREATE POLICY "Editors can modify shared milestones"
ON milestones FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = milestones.roadmap_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can create shared milestones" ON milestones;

CREATE POLICY "Editors can create shared milestones"
ON milestones FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = milestones.roadmap_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Editors can delete shared milestones" ON milestones;

CREATE POLICY "Editors can delete shared milestones"
ON milestones FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM roadmap_shares rs
    WHERE rs.roadmap_id = milestones.roadmap_id
    AND rs.permission = 'editor'
    AND (
      rs.shared_with_user_id = auth.uid()
      OR rs.shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);

-- Drop and recreate policies for roadmap_shares
DROP POLICY IF EXISTS "Owners can view shares of their roadmaps" ON roadmap_shares;

CREATE POLICY "Owners can view shares of their roadmaps"
ON roadmap_shares FOR SELECT
USING (
  shared_by_user_id = auth.uid()
  OR shared_with_user_id = auth.uid()
  OR shared_with_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Update link_share_to_user function and trigger to work with profiles
DROP TRIGGER IF EXISTS on_user_created_link_shares ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created_link_shares ON profiles;

CREATE OR REPLACE FUNCTION public.link_share_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a new profile is created, link pending shares
  UPDATE roadmap_shares
  SET shared_with_user_id = NEW.id
  WHERE shared_with_email = NEW.email
  AND shared_with_user_id IS NULL;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_link_shares
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION link_share_to_user();

-- Also update get_user_roadmap_role function to use profiles
CREATE OR REPLACE FUNCTION public.get_user_roadmap_role(_roadmap_id uuid, _user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM roadmaps
      WHERE id = _roadmap_id AND user_id = _user_id
    ) THEN 'owner'
    WHEN EXISTS (
      SELECT 1 FROM roadmap_shares rs
      JOIN profiles p ON p.id = _user_id
      WHERE rs.roadmap_id = _roadmap_id
      AND rs.permission = 'editor'
      AND (rs.shared_with_user_id = _user_id OR rs.shared_with_email = p.email)
    ) THEN 'editor'
    WHEN EXISTS (
      SELECT 1 FROM roadmap_shares rs
      JOIN profiles p ON p.id = _user_id
      WHERE rs.roadmap_id = _roadmap_id
      AND (rs.shared_with_user_id = _user_id OR rs.shared_with_email = p.email)
    ) THEN 'viewer'
    ELSE 'none'
  END;
$$;