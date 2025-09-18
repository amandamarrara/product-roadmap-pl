-- Create delivery_comments table for comment system
CREATE TABLE public.delivery_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID,
  sub_delivery_id UUID,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT delivery_comments_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id) ON DELETE CASCADE,
  CONSTRAINT delivery_comments_sub_delivery_id_fkey FOREIGN KEY (sub_delivery_id) REFERENCES public.sub_deliveries(id) ON DELETE CASCADE,
  CONSTRAINT delivery_comments_check CHECK ((delivery_id IS NOT NULL) OR (sub_delivery_id IS NOT NULL))
);

-- Enable Row Level Security
ALTER TABLE public.delivery_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_comments
CREATE POLICY "Users can view comments on their deliveries" 
ON public.delivery_comments 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  (delivery_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id AND d.user_id = auth.uid()
  )) OR
  (sub_delivery_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.sub_deliveries sd WHERE sd.id = sub_delivery_id AND sd.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create comments on their deliveries" 
ON public.delivery_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    (delivery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id AND d.user_id = auth.uid()
    )) OR
    (sub_delivery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.sub_deliveries sd WHERE sd.id = sub_delivery_id AND sd.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can delete their own comments" 
ON public.delivery_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_delivery_comments_updated_at
BEFORE UPDATE ON public.delivery_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();