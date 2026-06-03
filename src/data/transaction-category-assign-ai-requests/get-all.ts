import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionCategoryAssignAiRequest } from './types';

export type TransactionCategoryAssignAiRequestFilters = {
  transaction_id?: string;
  exchange_id?: string;
};

/**
 * Lists slug-assign AI request rows with optional filters.
 */
export const getAllTransactionCategoryAssignAiRequests = async (
  supabase: SupabaseClient,
  filters: TransactionCategoryAssignAiRequestFilters,
): Promise<TransactionCategoryAssignAiRequest[]> => {
  let q = supabase
    .from('transaction_category_assign_ai_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.transaction_id) {
    q = q.eq('transaction_id', filters.transaction_id);
  }
  if (filters.exchange_id) {
    q = q.eq('exchange_id', filters.exchange_id);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list category assign requests: ${error.message}`);
  }

  return (data ?? []) as TransactionCategoryAssignAiRequest[];
};
