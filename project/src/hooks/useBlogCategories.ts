import { useState, useEffect } from 'react';
import { supabase, Category, Tag } from '../lib/supabase';

export function useBlogCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      await fetchCategories(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create category' };
    }
  };

  return { categories, loading, error, refetch: fetchCategories, createCategory };
}

export function useBlogTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tag: Omit<Tag, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert(tag)
        .select()
        .single();

      if (error) throw error;
      await fetchTags(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create tag' };
    }
  };

  return { tags, loading, error, refetch: fetchTags, createTag };
}