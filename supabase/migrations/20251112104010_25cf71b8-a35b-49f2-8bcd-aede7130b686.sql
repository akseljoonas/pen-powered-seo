-- Add url field to tone_samples table to store blog URLs
ALTER TABLE public.tone_samples 
ADD COLUMN url TEXT;

-- Make content nullable since we'll fetch it from URLs
ALTER TABLE public.tone_samples 
ALTER COLUMN content DROP NOT NULL;