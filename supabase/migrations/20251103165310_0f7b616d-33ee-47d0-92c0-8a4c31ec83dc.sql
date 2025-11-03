-- Create Security Definer Functions to prevent infinite recursion in RLS policies

-- Function to check if user owns a roadmap (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_roadmap_owner(_roadmap_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM roadmaps
    WHERE id = _roadmap_id 
    AND user_id = _user_id
  );
$$;

-- Function to get user email (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM profiles WHERE id = _user_id;
$$;

-- Function to check if user has access to roadmap via shares (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_roadmap_access(_roadmap_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM roadmap_shares
    WHERE roadmap_id = _roadmap_id
    AND (
      shared_with_user_id = _user_id
      OR shared_with_email = (SELECT email FROM profiles WHERE id = _user_id)
    )
  );
$$;

-- Function to check if user has editor access (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_editor_access(_roadmap_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM roadmap_shares
    WHERE roadmap_id = _roadmap_id
    AND permission = 'editor'
    AND (
      shared_with_user_id = _user_id
      OR shared_with_email = (SELECT email FROM profiles WHERE id = _user_id)
    )
  );
$$;

-- ============================================
-- Recreate RLS policies for roadmap_shares
-- ============================================

DROP POLICY IF EXISTS "Owners can view shares of their roadmaps" ON roadmap_shares;
DROP POLICY IF EXISTS "Owners can create shares" ON roadmap_shares;
DROP POLICY IF EXISTS "Owners can update shares" ON roadmap_shares;
DROP POLICY IF EXISTS "Owners can delete shares" ON roadmap_shares;

-- SELECT: Users can view shares they created, received, or are for their email
CREATE POLICY "Owners can view shares of their roadmaps"
ON roadmap_shares FOR SELECT
USING (
  shared_by_user_id = auth.uid()
  OR shared_with_user_id = auth.uid()
  OR shared_with_email = public.get_user_email(auth.uid())
);

-- INSERT: Only roadmap owners can create shares (using security definer function)
CREATE POLICY "Owners can create shares"
ON roadmap_shares FOR INSERT
WITH CHECK (
  public.is_roadmap_owner(roadmap_id, auth.uid())
);

-- UPDATE: Only roadmap owners can update shares
CREATE POLICY "Owners can update shares"
ON roadmap_shares FOR UPDATE
USING (
  public.is_roadmap_owner(roadmap_id, auth.uid())
);

-- DELETE: Only roadmap owners can delete shares
CREATE POLICY "Owners can delete shares"
ON roadmap_shares FOR DELETE
USING (
  public.is_roadmap_owner(roadmap_id, auth.uid())
);

-- ============================================
-- Recreate RLS policies for roadmaps
-- ============================================

DROP POLICY IF EXISTS "Users can view their own or shared roadmaps" ON roadmaps;

CREATE POLICY "Users can view their own or shared roadmaps"
ON roadmaps FOR SELECT
USING (
  user_id = auth.uid()
  OR public.has_roadmap_access(id, auth.uid())
);

-- ============================================
-- Recreate RLS policies for deliveries
-- ============================================

DROP POLICY IF EXISTS "Users can view their own or shared deliveries" ON deliveries;
DROP POLICY IF EXISTS "Editors can modify shared deliveries" ON deliveries;
DROP POLICY IF EXISTS "Editors can create shared deliveries" ON deliveries;
DROP POLICY IF EXISTS "Editors can delete shared deliveries" ON deliveries;

CREATE POLICY "Users can view their own or shared deliveries"
ON deliveries FOR SELECT
USING (
  user_id = auth.uid()
  OR public.has_roadmap_access(roadmap_id, auth.uid())
);

CREATE POLICY "Editors can modify shared deliveries"
ON deliveries FOR UPDATE
USING (
  user_id = auth.uid()
  OR public.has_editor_access(roadmap_id, auth.uid())
);

CREATE POLICY "Editors can create shared deliveries"
ON deliveries FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.has_editor_access(roadmap_id, auth.uid())
);

CREATE POLICY "Editors can delete shared deliveries"
ON deliveries FOR DELETE
USING (
  user_id = auth.uid()
  OR public.has_editor_access(roadmap_id, auth.uid())
);

-- ============================================
-- Recreate RLS policies for sub_deliveries
-- ============================================

DROP POLICY IF EXISTS "Users can view their own or shared sub_deliveries" ON sub_deliveries;
DROP POLICY IF EXISTS "Editors can modify shared sub_deliveries" ON sub_deliveries;
DROP POLICY IF EXISTS "Editors can create shared sub_deliveries" ON sub_deliveries;
DROP POLICY IF EXISTS "Editors can delete shared sub_deliveries" ON sub_deliveries;

CREATE POLICY "Users can view their own or shared sub_deliveries"
ON sub_deliveries FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM deliveries d
    WHERE d.id = sub_deliveries.delivery_id
    AND (d.user_id = auth.uid() OR public.has_roadmap_access(d.roadmap_id, auth.uid()))
  )
);

CREATE POLICY "Editors can modify shared sub_deliveries"
ON sub_deliveries FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM deliveries d
    WHERE d.id = sub_deliveries.delivery_id
    AND (d.user_id = auth.uid() OR public.has_editor_access(d.roadmap_id, auth.uid()))
  )
);

CREATE POLICY "Editors can create shared sub_deliveries"
ON sub_deliveries FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM deliveries d
    WHERE d.id = sub_deliveries.delivery_id
    AND (d.user_id = auth.uid() OR public.has_editor_access(d.roadmap_id, auth.uid()))
  )
);

CREATE POLICY "Editors can delete shared sub_deliveries"
ON sub_deliveries FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM deliveries d
    WHERE d.id = sub_deliveries.delivery_id
    AND (d.user_id = auth.uid() OR public.has_editor_access(d.roadmap_id, auth.uid()))
  )
);

-- ============================================
-- Recreate RLS policies for milestones
-- ============================================

DROP POLICY IF EXISTS "Users can view their own or shared milestones" ON milestones;
DROP POLICY IF EXISTS "Editors can modify shared milestones" ON milestones;
DROP POLICY IF EXISTS "Editors can create shared milestones" ON milestones;
DROP POLICY IF EXISTS "Editors can delete shared milestones" ON milestones;

CREATE POLICY "Users can view their own or shared milestones"
ON milestones FOR SELECT
USING (
  user_id = auth.uid()
  OR public.has_roadmap_access(roadmap_id, auth.uid())
);

CREATE POLICY "Editors can modify shared milestones"
ON milestones FOR UPDATE
USING (
  user_id = auth.uid()
  OR public.has_editor_access(roadmap_id, auth.uid())
);

CREATE POLICY "Editors can create shared milestones"
ON milestones FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.has_editor_access(roadmap_id, auth.uid())
);

CREATE POLICY "Editors can delete shared milestones"
ON milestones FOR DELETE
USING (
  user_id = auth.uid()
  OR public.has_editor_access(roadmap_id, auth.uid())
);