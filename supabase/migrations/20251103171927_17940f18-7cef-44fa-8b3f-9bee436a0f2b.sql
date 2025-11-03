-- Add public_share_token column to roadmaps table
ALTER TABLE roadmaps 
ADD COLUMN public_share_token TEXT UNIQUE;

-- Create index for performance
CREATE INDEX idx_roadmaps_public_share_token ON roadmaps(public_share_token);