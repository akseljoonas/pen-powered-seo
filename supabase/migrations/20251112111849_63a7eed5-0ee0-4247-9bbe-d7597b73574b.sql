-- Create brand_profiles table to store business information
CREATE TABLE public.brand_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  business_description TEXT,
  target_audience TEXT,
  benefits TEXT,
  location TEXT,
  language TEXT DEFAULT 'English',
  tone_of_voice TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create author_profiles table to store author information
CREATE TABLE public.author_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_profiles
CREATE POLICY "Users can view their own brand profile"
ON public.brand_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profile"
ON public.brand_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profile"
ON public.brand_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for author_profiles
CREATE POLICY "Users can view their own author profile"
ON public.author_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own author profile"
ON public.author_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own author profile"
ON public.author_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for blog_categories
CREATE POLICY "Users can view their own categories"
ON public.blog_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON public.blog_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.blog_categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.blog_categories FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for brand_profiles updated_at
CREATE TRIGGER update_brand_profiles_updated_at
BEFORE UPDATE ON public.brand_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for author_profiles updated_at
CREATE TRIGGER update_author_profiles_updated_at
BEFORE UPDATE ON public.author_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();