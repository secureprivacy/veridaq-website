/*
  # Create Posts and Translations System

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `original_language` (text, default 'en')
      - `author_id` (uuid, references auth.users)
      - `status` (text, default 'draft') - 'draft', 'published', 'archived'
      - `featured_image_url` (text)
      - `meta_title` (text)
      - `meta_description` (text)
      - `meta_keywords` (text)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `post_translations`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `language_code` (text)
      - `title` (text)
      - `slug` (text)
      - `content` (text)
      - `excerpt` (text)
      - `meta_title` (text)
      - `meta_description` (text)
      - `meta_keywords` (text)
      - `translation_status` (text, default 'pending')
      - `translated_by` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Role-based access control for content management
    - Public read access for published content

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for multi-column lookups
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  original_language text NOT NULL DEFAULT 'en',
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image_url text,
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  meta_keywords text NOT NULL DEFAULT '',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post_translations table
CREATE TABLE IF NOT EXISTS post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  title text NOT NULL DEFAULT '',
  slug text NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  meta_keywords text NOT NULL DEFAULT '',
  translation_status text NOT NULL DEFAULT 'pending' CHECK (translation_status IN ('pending', 'completed', 'failed')),
  translated_by text CHECK (translated_by IN ('ai_claude', 'ai_chatgpt', 'human')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(post_id, language_code)
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_editor_or_admin(auth.uid()) AND auth.uid() = author_id
  );

CREATE POLICY "Authors can update their own posts or admins can update any"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Only admins can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Post translations policies
CREATE POLICY "Public can read published post translations"
  ON post_translations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_id AND p.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can read all translations"
  ON post_translations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors and admins can create translations"
  ON post_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors and admins can update translations"
  ON post_translations
  FOR UPDATE
  TO authenticated
  USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Only admins can delete translations"
  ON post_translations
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at);

CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON post_translations(slug);
CREATE INDEX IF NOT EXISTS idx_post_translations_status ON post_translations(translation_status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_post_translations_updated_at
  BEFORE UPDATE ON post_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();