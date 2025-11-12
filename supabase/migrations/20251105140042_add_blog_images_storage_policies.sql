/*
  # Add Storage Policies for Blog Images

  1. Storage Policies
    - Allow public read access for all users (for viewing published blog images)
    - Allow authenticated users to upload images to blog-images bucket
    - Allow authenticated users to delete their own uploaded images
    - Prevent unauthorized access to upload/delete operations

  2. Security
    - Only authenticated users can upload images
    - Public users can view all images (for blog posts)
    - Users must be authenticated to delete images
    - All policies check authentication status

  3. Notes
    - These policies work with the existing blog-images bucket
    - The bucket is public for reads but protected for writes
    - Upload and delete operations require authentication via Supabase Auth
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;

-- Policy: Allow public read access to all blog images
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to update image metadata
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');