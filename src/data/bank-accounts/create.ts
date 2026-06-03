import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankAccount, CreateBankAccountInput } from './types';

/**
 * Inserts a bank account row.
 */
export const createBankAccount = async (
  supabase: SupabaseClient,
  input: CreateBankAccountInput,
): Promise<BankAccount> => {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .insert({
      name,
      account_type: input.account_type?.trim() || 'checking',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create bank account: ${error.message}`);
  }

  return data as BankAccount;
};
