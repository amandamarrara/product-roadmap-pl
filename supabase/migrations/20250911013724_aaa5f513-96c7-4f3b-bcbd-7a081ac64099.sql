-- First, add user_id columns to associate data with authenticated users
ALTER TABLE public.roadmaps 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.deliveries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.sub_deliveries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX idx_sub_deliveries_user_id ON public.sub_deliveries(user_id);

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Anyone can delete roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Anyone can read roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Anyone can update roadmaps" ON public.roadmaps;

DROP POLICY IF EXISTS "Anyone can create deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Anyone can delete deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Anyone can read deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Anyone can update deliveries" ON public.deliveries;

DROP POLICY IF EXISTS "Anyone can create sub_deliveries" ON public.sub_deliveries;
DROP POLICY IF EXISTS "Anyone can delete sub_deliveries" ON public.sub_deliveries;
DROP POLICY IF EXISTS "Anyone can read sub_deliveries" ON public.sub_deliveries;
DROP POLICY IF EXISTS "Anyone can update sub_deliveries" ON public.sub_deliveries;

-- Create secure RLS policies for roadmaps
CREATE POLICY "Users can view their own roadmaps" 
ON public.roadmaps 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps" 
ON public.roadmaps 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" 
ON public.roadmaps 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" 
ON public.roadmaps 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for deliveries
CREATE POLICY "Users can view their own deliveries" 
ON public.deliveries 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deliveries" 
ON public.deliveries 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries" 
ON public.deliveries 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliveries" 
ON public.deliveries 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for sub_deliveries
CREATE POLICY "Users can view their own sub_deliveries" 
ON public.sub_deliveries 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sub_deliveries" 
ON public.sub_deliveries 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sub_deliveries" 
ON public.sub_deliveries 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sub_deliveries" 
ON public.sub_deliveries 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);