import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transaction } from './types';

export const getTransactionById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<Transaction | null> => {
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
