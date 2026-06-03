import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionCategoryAssignAiExchange } from './types';

export type TransactionCategoryAssignAiExchangeFilters = {
  transaction_id?: string;
};

/**
 * Lists category-assign AI exchanges; all completed rows when transaction_id omitted.
 */
export const getAllTransactionCategoryAssignAiExchanges = async (
  supabase: SupabaseClient,
  filters: TransactionCategoryAssignAiExchangeFilters = {},
): Promise<TransactionCategoryAssignAiExchange[]> => {
  let query = supabase
    .from('transaction_category_assign_ai_exchanges')
    .select('*')
    .eq('status', 'completed')
    .not('input_tokens', 'is', null)
    .not('output_tokens', 'is', null);

  if (filters.transaction_id) {
    query = query.eq('transaction_id', filters.transaction_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list category assign exchanges: ${error.message}`);
  }

  return (data ?? []) as TransactionCategoryAssignAiExchange[];
};
