import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a loan vendor by id.
 */
export const deleteLoanVendor = async (
  supabase: SupabaseClient,
  id: string,
): Promise<void> => {
  const { error } = await supabase.from('loan_vendors').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete loan vendor: ${error.message}`);
  }
};
