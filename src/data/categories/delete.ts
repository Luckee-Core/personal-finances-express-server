import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a category by id.
 */
export const deleteCategory = async (supabase: SupabaseClient, id: string): Promise<void> => {
  console.log('💾 deleteCategory', id);
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};
