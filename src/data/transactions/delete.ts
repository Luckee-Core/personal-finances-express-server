import type { SupabaseClient } from '@supabase/supabase-js';

export const deleteTransaction = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
};
