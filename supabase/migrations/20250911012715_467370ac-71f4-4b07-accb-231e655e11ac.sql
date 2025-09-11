-- Create roadmaps table
CREATE TABLE public.roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT 'system'
);

-- Create deliveries table
CREATE TABLE public.deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  complexity TEXT CHECK (complexity IN ('simple', 'medium', 'complex', 'very-complex')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  delivery_color TEXT,
  delivery_phase TEXT,
  jira_link TEXT,
  progress INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked')) DEFAULT 'not-started',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub_deliveries table
CREATE TABLE public.sub_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  team TEXT,
  responsible TEXT,
  completed BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked')) DEFAULT 'not-started',
  jira_link TEXT
);

-- Enable Row Level Security
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can read roadmaps" ON public.roadmaps FOR SELECT USING (true);
CREATE POLICY "Anyone can create roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update roadmaps" ON public.roadmaps FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete roadmaps" ON public.roadmaps FOR DELETE USING (true);

CREATE POLICY "Anyone can read deliveries" ON public.deliveries FOR SELECT USING (true);
CREATE POLICY "Anyone can create deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update deliveries" ON public.deliveries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete deliveries" ON public.deliveries FOR DELETE USING (true);

CREATE POLICY "Anyone can read sub_deliveries" ON public.sub_deliveries FOR SELECT USING (true);
CREATE POLICY "Anyone can create sub_deliveries" ON public.sub_deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sub_deliveries" ON public.sub_deliveries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sub_deliveries" ON public.sub_deliveries FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_roadmaps_updated_at
BEFORE UPDATE ON public.roadmaps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();