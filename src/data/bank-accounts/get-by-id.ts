import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankAccount } from './types';

/**
 * Fetches a bank account by id.
 */
export const getBankAccountById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<BankAccount | null> => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch bank account: ${error.message}`);
  }

  return data as BankAccount | null;
};
