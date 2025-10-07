-- Add support for milestone periods
ALTER TABLE milestones 
ADD COLUMN end_date date,
ADD COLUMN is_period boolean DEFAULT false;