-- Add foreign key relation between milestones.roadmap_id and roadmaps.id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'milestones'
      AND c.conname = 'milestones_roadmap_id_fkey'
  ) THEN
    ALTER TABLE public.milestones
    ADD CONSTRAINT milestones_roadmap_id_fkey
    FOREIGN KEY (roadmap_id)
    REFERENCES public.roadmaps(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Helpful index for faster lookups
CREATE INDEX IF NOT EXISTS idx_milestones_roadmap_id ON public.milestones(roadmap_id);