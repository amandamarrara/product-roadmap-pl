-- Add responsible column to deliveries table
ALTER TABLE public.deliveries 
ADD COLUMN responsible TEXT;