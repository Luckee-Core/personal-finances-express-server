import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankAccount } from './types';

/**
 * Lists all bank accounts.
 */
export const getAllBankAccounts = async (supabase: SupabaseClient): Promise<BankAccount[]> => {
  const { data, error } = await supabase.from('bank_accounts').select('*').order('name');

  if (error) {
    throw new Error(`Failed to fetch bank accounts: ${error.message}`);
  }

  return (data ?? []) as BankAccount[];
};
