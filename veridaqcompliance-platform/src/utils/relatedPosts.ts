import { supabase, Post, PostTranslation } from '../lib/supabase';

interface RelatedPostResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  meta_description?: string;
  featured_image_url?: string;
  published_at?: string;
  similarity_score: number;
}

export async function getRelatedPosts(
  currentPostSlug: string,
  language: string = 'en',
  limit: number = 3
): Promise<RelatedPostResult[]> {
  try {
    if (language === 'en') {
      const { data: currentPost, error: currentError } = await supabase
        .from('posts')
        .select('id, meta_keywords')
        .eq('slug', currentPostSlug)
        .eq('status', 'published')
        .maybeSingle();

      if (currentError || !currentPost) {
        console.warn('Could not fetch current post for related posts');
        return [];
      }

      const currentKeywords = parseKeywords(currentPost.meta_keywords);
      if (currentKeywords.length === 0) {
        console.warn('Current post has no keywords');
        return await getFallbackPosts(currentPost.id, language, limit);
      }

      const { data: allPosts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, meta_description, meta_keywords, featured_image_url, published_at')
        .eq('status', 'published')
        .neq('id', currentPost.id);

      if (postsError || !allPosts) {
        return [];
      }

      const scoredPosts = allPosts
        .map(post => ({
          ...post,
          similarity_score: calculateSimilarity(currentKeywords, parseKeywords(post.meta_keywords))
        }))
        .filter(post => post.similarity_score > 0)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);

      if (scoredPosts.length === 0) {
        return await getFallbackPosts(currentPost.id, language, limit);
      }

      return scoredPosts;
    } else {
      const { data: currentTranslation, error: currentError } = await supabase
        .from('post_translations')
        .select('id, post_id, meta_keywords, posts!inner(id, status)')
        .eq('slug', currentPostSlug)
        .eq('language_code', language)
        .eq('translation_status', 'completed')
        .eq('published', true)
        .eq('posts.status', 'published')
        .maybeSingle();

      if (currentError || !currentTranslation) {
        console.warn('Could not fetch current translation for related posts');
        return [];
      }

      const currentKeywords = parseKeywords(currentTranslation.meta_keywords);
      if (currentKeywords.length === 0) {
        return await getFallbackPosts(currentTranslation.post_id, language, limit);
      }

      const { data: allTranslations, error: transError } = await supabase
        .from('post_translations')
        .select(`
          id, title, slug, excerpt, meta_description, meta_keywords, featured_image_url,
          posts!inner(id, status, published_at)
        `)
        .eq('language_code', language)
        .eq('translation_status', 'completed')
        .eq('published', true)
        .eq('posts.status', 'published')
        .neq('post_id', currentTranslation.post_id);

      if (transError || !allTranslations) {
        return [];
      }

      const scoredPosts = allTranslations
        .map(trans => ({
          id: trans.id,
          title: trans.title,
          slug: trans.slug,
          excerpt: trans.excerpt,
          meta_description: trans.meta_description,
          featured_image_url: trans.featured_image_url,
          published_at: (trans.posts as any).published_at,
          similarity_score: calculateSimilarity(currentKeywords, parseKeywords(trans.meta_keywords))
        }))
        .filter(post => post.similarity_score > 0)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);

      if (scoredPosts.length === 0) {
        return await getFallbackPosts(currentTranslation.post_id, language, limit);
      }

      return scoredPosts;
    }
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

function parseKeywords(keywordsString?: string): string[] {
  if (!keywordsString) return [];

  return keywordsString
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);
}

function calculateSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));

  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

async function getFallbackPosts(
  excludePostId: string,
  language: string,
  limit: number
): Promise<RelatedPostResult[]> {
  try {
    if (language === 'en') {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, meta_description, featured_image_url, published_at')
        .eq('status', 'published')
        .neq('id', excludePostId)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map(post => ({ ...post, similarity_score: 0 }));
    } else {
      const { data, error } = await supabase
        .from('post_translations')
        .select(`
          id, title, slug, excerpt, meta_description, featured_image_url,
          posts!inner(id, status, published_at)
        `)
        .eq('language_code', language)
        .eq('translation_status', 'completed')
        .eq('published', true)
        .eq('posts.status', 'published')
        .neq('post_id', excludePostId)
        .order('posts(published_at)', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map(trans => ({
        id: trans.id,
        title: trans.title,
        slug: trans.slug,
        excerpt: trans.excerpt,
        meta_description: trans.meta_description,
        featured_image_url: trans.featured_image_url,
        published_at: (trans.posts as any).published_at,
        similarity_score: 0
      }));
    }
  } catch (error) {
    console.error('Error fetching fallback posts:', error);
    return [];
  }
}
