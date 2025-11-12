/*
  # Create blog categories and tags system

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `slug` (text, unique, not null)
      - `description` (text)
      - `created_at` (timestamptz, default now())
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `slug` (text, unique, not null)
      - `created_at` (timestamptz, default now())
    - `post_categories`
      - `post_id` (uuid, foreign key to posts)
      - `category_id` (uuid, foreign key to categories)
    - `post_tags`
      - `post_id` (uuid, foreign key to posts)
      - `tag_id` (uuid, foreign key to tags)

  2. Security
    - Enable RLS on all tables
    - Allow public read access to categories and tags
    - Allow authenticated users to manage post categorization
    - Only admins and editors can manage categories and tags
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create post_categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Public can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Editors and admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'editor')
    )
  );

-- Tags policies
CREATE POLICY "Public can read tags"
  ON tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Editors and admins can manage tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'editor')
    )
  );

-- Post categories policies
CREATE POLICY "Public can read post categories"
  ON post_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Editors and admins can manage post categories"
  ON post_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'editor')
    )
  );

-- Post tags policies
CREATE POLICY "Public can read post tags"
  ON post_tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Editors and admins can manage post tags"
  ON post_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'editor')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Insert some default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Posts about technology and innovation'),
  ('Business', 'business', 'Business insights and strategies'),
  ('Tutorials', 'tutorials', 'Step-by-step guides and how-tos')
ON CONFLICT (name) DO NOTHING;

-- Insert some default tags
INSERT INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('TypeScript', 'typescript'),
  ('JavaScript', 'javascript'),
  ('Web Development', 'web-development'),
  ('AI', 'ai'),
  ('Machine Learning', 'machine-learning')
ON CONFLICT (name) DO NOTHING;