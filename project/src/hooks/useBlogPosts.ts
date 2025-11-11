import { useState, useEffect } from 'react';
import { supabase, Post, PostTranslation } from '../lib/supabase';
import { normalizeLanguageCode } from '../utils/languageUtils';

interface BlogPostHookOptions {
  language?: string;
  status?: string;
  limit?: number;
}

export function useBlogPosts(options: BlogPostHookOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [translations, setTranslations] = useState<PostTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language = 'en', status = 'published', limit } = options;

  // Normalize language code using utility function
  const normalizedLanguage = normalizeLanguageCode(language);

  useEffect(() => {
    fetchPosts();
  }, [language, status, limit]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (normalizedLanguage === 'en') {
        // Fetch original posts in English
        console.log('🔍 Fetching English posts');

        let query = supabase
          .from('posts')
          .select('*')
          .eq('status', status)
          .eq('original_language', 'en')
          .order('published_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setPosts(data || []);
      } else {
        // Fetch translated posts
        console.log('🔍 Fetching translations for:', {
          requestedLanguage: language,
          normalizedLanguage,
          status
        });

        let query = supabase
          .from('post_translations')
          .select(`
            *,
            posts!inner(status, published_at, author_id)
          `)
          .eq('language_code', normalizedLanguage)
          .eq('translation_status', 'completed')
          .eq('published', true)
          .eq('posts.status', 'published')
          .order('published_at', { foreignTable: 'posts', ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        console.log('✅ useBlogPosts: Translation fetch result', {
          language,
          normalizedLanguage,
          dataLength: data?.length || 0,
          error: error?.message || 'none',
          sampleTranslation: data?.[0] ? {
            id: data[0].id,
            title: data[0].title?.substring(0, 50) + '...',
            language_code: data[0].language_code,
            published: data[0].published,
            translation_status: data[0].translation_status
          } : 'none'
        });

        if (error) throw error;
        setTranslations(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const createPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          published_at: postData.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      await fetchPosts(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create post' };
    }
  };

  // Update post
  const updatePost = async (postId: string, updates: Partial<Post>) => {
    try {
      const finalUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If publishing, set published_at
      if (updates.status === 'published' && !updates.published_at) {
        finalUpdates.published_at = new Date().toISOString();
      }

      // If changing from published to draft, clear published_at
      if (updates.status === 'draft') {
        finalUpdates.published_at = null;
      }

      const { data, error } = await supabase
        .from('posts')
        .update(finalUpdates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      await fetchPosts(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update post' };
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      await fetchPosts(); // Refresh list
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete post' };
    }
  };

  return { 
    posts, 
    translations, 
    loading, 
    error, 
  };
}

// Admin-focused hook for post management
export function useAllPosts(options: BlogPostHookOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status = 'published', limit } = options;

  useEffect(() => {
    fetchAllPosts();
  }, [status, limit]);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const createPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          published_at: postData.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAllPosts(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create post' };
    }
  };

  // Update post
  const updatePost = async (postId: string, updates: Partial<Post>) => {
    try {
      const finalUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If publishing, set published_at
      if (updates.status === 'published' && !updates.published_at) {
        finalUpdates.published_at = new Date().toISOString();
      }

      // If changing from published to draft, clear published_at
      if (updates.status === 'draft') {
        finalUpdates.published_at = null;
      }

      const { data, error } = await supabase
        .from('posts')
        .update(finalUpdates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      await fetchAllPosts(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update post' };
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      await fetchAllPosts(); // Refresh list
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete post' };
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    refetchPosts: fetchAllPosts
  };
}

// Hook for fetching a single blog post
export function useBlogPost(slug: string, language: string = 'en') {
  const [post, setPost] = useState<Post | PostTranslation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedLanguage = normalizeLanguageCode(language);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, language]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      setPost(null);

      console.log('🔍 Fetching post:', {
        slug,
        requestedLanguage: language,
        normalizedLanguage
      });

      if (normalizedLanguage === 'en') {
        // Fetch original English post
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Post not found');
        
        console.log('✅ Found English post:', data.title);
        setPost(data);
      } else {
        // Fetch translation (non-English)
        console.log('🌍 Looking for translation...');

        const { data: translation, error: translationError } = await supabase
          .from('post_translations')
          .select(`
            *,
            posts!inner(status, author_id, published_at)
          `)
          .eq('slug', slug)
          .eq('language_code', normalizedLanguage)
          .eq('translation_status', 'completed')
          .eq('published', true)
          .eq('posts.status', 'published')
          .maybeSingle();

        if (translationError) {
          console.error('⚠️ Translation query error:', translationError);
          throw translationError;
        }

        if (translation) {
          console.log('✅ Found translation:', {
            title: translation.title,
            language: translation.language_code
          });
          setPost(translation);
          return;
        }

        // Translation not found - fallback to English
        console.log('⚠️ Translation not available, showing English version');

        const { data: englishPost, error: englishError } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (englishError) throw englishError;

        if (englishPost) {
          console.log('✅ Showing English version as fallback');
          setPost(englishPost);

          // Show user-friendly notification that translation is not available
          const notification = document.createElement('div');
          notification.className = 'fixed top-6 right-6 bg-yellow-600 text-white p-4 rounded-xl shadow-lg z-50 max-w-sm';
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div class="font-semibold">Translation Not Available</div>
                <div class="text-sm text-yellow-100 mt-1">Showing English version</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);

          // Auto-remove notification after 5 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 5000);

          return;
        }

        // Neither translation nor English post found
        throw new Error(`Post not found: ${slug}`);
      }
    } catch (err) {
      console.error('❌ Error in fetchPost:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  return { post, loading, error };
}