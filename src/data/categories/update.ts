import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, UpdateCategoryInput } from './types';

/**
 * Updates a category row.
 */
export const updateCategory = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> => {
  console.log('💾 updateCategory', { id });
  const patch: Record<string, string | null> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }
  if (input.color !== undefined) {
    patch.color = input.color?.trim() || null;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data as Category;
};
