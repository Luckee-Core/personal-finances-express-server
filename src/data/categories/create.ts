import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, CreateCategoryInput } from './types';

/**
 * Inserts a category row.
 */
export const createCategory = async (
  supabase: SupabaseClient,
  input: CreateCategoryInput,
): Promise<Category> => {
  console.log('💾 createCategory', { name: input.name });
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      color: input.color?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data as Category;
};
