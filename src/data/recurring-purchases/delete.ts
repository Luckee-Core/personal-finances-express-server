import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a recurring purchase by id.
 */
export const deleteRecurringPurchase = async (
  supabase: SupabaseClient,
  id: string,
): Promise<void> => {
  console.log('💾 deleteRecurringPurchase', id);
  const { error } = await supabase.from('recurring_purchases').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete recurring purchase: ${error.message}`);
  }
};
