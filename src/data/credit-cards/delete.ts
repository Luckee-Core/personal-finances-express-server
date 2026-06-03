import type { SupabaseClient } from '@supabase/supabase-js';

export const deleteCreditCard = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete credit card: ${error.message}`);
  }
};
