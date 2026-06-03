import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a bank account by id.
 */
export const deleteBankAccount = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('bank_accounts').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete bank account: ${error.message}`);
  }
};
