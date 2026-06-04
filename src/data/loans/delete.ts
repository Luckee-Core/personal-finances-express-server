import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a loan by id.
 */
export const deleteLoan = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('loans').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete loan: ${error.message}`);
  }
};
