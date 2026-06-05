import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transaction } from './types';

/**
 * Fetches a transaction by id.
 */
export const getTransactionById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<Transaction | null> => {
  console.log('💾 getTransactionById', id);
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return data as Transaction | null;
};
