import type { SupabaseClient } from '@supabase/supabase-js';

export const deleteRecurringPurchase = async (
  supabase: SupabaseClient,
  id: string,
): Promise<void> => {
  const { error } = await supabase.from('recurring_purchases').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete recurring purchase: ${error.message}`);
  }
};
