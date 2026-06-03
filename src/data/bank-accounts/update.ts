import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankAccount, UpdateBankAccountInput } from './types';

/**
 * Updates a bank account row.
 */
export const updateBankAccount = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateBankAccountInput,
): Promise<BankAccount> => {
  const patch: Record<string, string> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }
  if (input.account_type !== undefined) {
    patch.account_type = input.account_type.trim() || 'checking';
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update bank account: ${error.message}`);
  }

  return data as BankAccount;
};
