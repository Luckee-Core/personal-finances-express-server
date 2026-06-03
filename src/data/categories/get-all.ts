import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from './types';

export const getAllCategories = async (supabase: SupabaseClient): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('name');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data ?? []) as Category[];
};
