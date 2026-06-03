import type { SupabaseClient } from '@supabase/supabase-js';

export const deleteCategory = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};
