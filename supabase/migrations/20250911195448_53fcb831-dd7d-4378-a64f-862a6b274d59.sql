-- Create milestones table for roadmap key dates
CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  color text DEFAULT '#ef4444',
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for milestones
CREATE POLICY "Users can view their own milestones" 
ON public.milestones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones" 
ON public.milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" 
ON public.milestones 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" 
ON public.milestones 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();