import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transaction, TransactionListFilters } from './types';

/**
 * Lists transactions with optional filters.
 */
export const getAllTransactions = async (
  supabase: SupabaseClient,
  filters: TransactionListFilters = {},
): Promise<Transaction[]> => {
  console.log('💾 getAllTransactions', filters);
  let query = supabase.from('transactions').select('*').order('posted_on', { ascending: false });

  if (filters.bankAccountId) {
    query = query.eq('bank_account_id', filters.bankAccountId);
  }
  if (filters.creditCardId) {
    query = query.eq('credit_card_id', filters.creditCardId);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.source) {
    query = query.eq('source', filters.source);
  }
  if (filters.fromDate) {
    query = query.gte('posted_on', filters.fromDate);
  }
  if (filters.toDate) {
    query = query.lte('posted_on', filters.toDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return (data ?? []) as Transaction[];
};
