import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a credit card by id.
 */
export const deleteCreditCard = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete credit card: ${error.message}`);
  }
};
