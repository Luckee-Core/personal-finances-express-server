import type { SupabaseClient } from '@supabase/supabase-js';
import { getBankAccountById } from '../../data/bank-accounts';
import { getCreditCardById } from '../../data/credit-cards';
import type { Transaction } from '../../data/transactions/types';

export const resolveTransactionAccountName = async (
  supabase: SupabaseClient,
  transaction: Pick<Transaction, 'bank_account_id' | 'credit_card_id'>,
): Promise<string | null> => {
  if (transaction.bank_account_id) {
    const account = await getBankAccountById(supabase, transaction.bank_account_id);
    return account?.name ?? null;
  }
  if (transaction.credit_card_id) {
    const card = await getCreditCardById(supabase, transaction.credit_card_id);
    return card?.name ?? null;
  }
  return null;
};
