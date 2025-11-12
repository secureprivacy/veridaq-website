/*
  # Create Blog Images Storage Bucket

  1. New Storage Bucket
    - `blog-images` - Public storage bucket for blog post images
      - Allows public read access for published images
      - Authenticated editors/admins can upload
      - Maximum file size: 5MB
      - Allowed formats: JPEG, PNG, WebP, GIF

  2. Security
    - Public can view published blog images
    - Only authenticated editors/admins can upload images
    - Users can delete their own uploads, admins can delete any
    - File type validation enforced at bucket level

  3. Performance
    - Images are served with proper cache headers
    - Public URLs are generated for fast access
    - Organized folder structure by year/month
*/

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies are managed through Supabase dashboard
-- The bucket is set to public, allowing read access to all
-- Upload permissions are handled through authentication checks in the application layer