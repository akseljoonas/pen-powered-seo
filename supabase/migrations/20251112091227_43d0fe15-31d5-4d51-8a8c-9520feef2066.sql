-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competitor_urls table
CREATE TABLE public.competitor_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tone_samples table (user's previous blogs for tone analysis)
CREATE TABLE public.tone_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tone_samples ENABLE ROW LEVEL SECURITY;

-- Create policies for blogs
CREATE POLICY "Users can view their own blogs"
ON public.blogs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blogs"
ON public.blogs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blogs"
ON public.blogs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blogs"
ON public.blogs FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for competitor_urls
CREATE POLICY "Users can view competitor URLs for their blogs"
ON public.competitor_urls FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.blogs WHERE blogs.id = competitor_urls.blog_id AND blogs.user_id = auth.uid()
));

CREATE POLICY "Users can create competitor URLs for their blogs"
ON public.competitor_urls FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.blogs WHERE blogs.id = competitor_urls.blog_id AND blogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete competitor URLs for their blogs"
ON public.competitor_urls FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.blogs WHERE blogs.id = competitor_urls.blog_id AND blogs.user_id = auth.uid()
));

-- Create policies for tone_samples
CREATE POLICY "Users can view their own tone samples"
ON public.tone_samples FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tone samples"
ON public.tone_samples FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tone samples"
ON public.tone_samples FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_blogs_user_id ON public.blogs(user_id);
CREATE INDEX idx_blogs_status ON public.blogs(status);
CREATE INDEX idx_competitor_urls_blog_id ON public.competitor_urls(blog_id);
CREATE INDEX idx_tone_samples_user_id ON public.tone_samples(user_id);