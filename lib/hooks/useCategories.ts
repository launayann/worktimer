'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category, NewCategory } from '@/types/database';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setCategories(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  // Create a new category
  const createCategory = async (category: NewCategory) => {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        setCategories((prev) => [...prev, data]);
      }
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la création de la catégorie';
      return { data: null, error: errorMsg };
    }
  };

  // Update an existing category
  const updateCategory = async (id: string, updates: Partial<NewCategory>) => {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? data : cat))
        );
      }
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la catégorie';
      return { data: null, error: errorMsg };
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la suppression de la catégorie';
      return { error: errorMsg };
    }
  };

  useEffect(() => {
    fetchCategories();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
