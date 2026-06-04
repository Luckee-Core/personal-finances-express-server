import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes an anticipated cost by id.
 */
export const deleteAnticipatedCost = async (
  supabase: SupabaseClient,
  id: string,
): Promise<void> => {
  const { error } = await supabase.from('anticipated_costs').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete anticipated cost: ${error.message}`);
  }
};
