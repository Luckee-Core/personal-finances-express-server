import type { SupabaseClient } from '@supabase/supabase-js';

export type TransactionDedupeField = {
  posted_on: string;
  amount_cents: number;
  description: string | null;
};

export type TransactionDedupeScope =
  | { bankAccountId: string; creditCardId?: never }
  | { creditCardId: string; bankAccountId?: never };

export const selectTransactionDedupeFields = async (
  supabase: SupabaseClient,
  scope: TransactionDedupeScope,
): Promise<TransactionDedupeField[]> => {
  console.log('💾 selectTransactionDedupeFields', scope);
  let query = supabase.from('transactions').select('posted_on, amount_cents, description');

  if ('bankAccountId' in scope && scope.bankAccountId) {
    query = query.eq('bank_account_id', scope.bankAccountId);
  } else if ('creditCardId' in scope && scope.creditCardId) {
    query = query.eq('credit_card_id', scope.creditCardId);
  } else {
    throw new Error('bankAccountId or creditCardId is required');
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load existing transactions: ${error.message}`);
  }

  return (data ?? []) as TransactionDedupeField[];
};
