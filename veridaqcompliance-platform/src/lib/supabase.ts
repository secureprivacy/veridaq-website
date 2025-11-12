// Import the configured auth client
export { supabase } from './auth';

// Database types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  original_language: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  featured_image_url?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  focus_keyword: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PostTranslation {
  id: string;
  post_id: string;
  language_code: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  translation_status: 'pending' | 'completed' | 'failed';
  published?: boolean;
  translated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface PostCategory {
  post_id: string;
  category_id: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}