import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from './types';

/**
 * Lists all categories.
 */
export const getAllCategories = async (supabase: SupabaseClient): Promise<Category[]> => {
  console.log('💾 getAllCategories');
  const { data, error } = await supabase.from('categories').select('*').order('name');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data ?? []) as Category[];
};
