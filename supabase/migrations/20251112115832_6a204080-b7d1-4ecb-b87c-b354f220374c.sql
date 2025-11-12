-- Create storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true);

-- Allow authenticated users to upload images
create policy "Users can upload their own blog images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'blog-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view all blog images (public bucket)
create policy "Anyone can view blog images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

-- Allow users to delete their own images
create policy "Users can delete their own blog images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'blog-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);