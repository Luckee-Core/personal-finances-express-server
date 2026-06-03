import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionSlugAssignAiExchange } from './types';

export type TransactionSlugAssignAiExchangeFilters = {
  transaction_id?: string;
};

/**
 * Lists slug-assign AI exchanges; all completed rows when transaction_id omitted.
 */
export const getAllTransactionSlugAssignAiExchanges = async (
  supabase: SupabaseClient,
  filters: TransactionSlugAssignAiExchangeFilters = {},
): Promise<TransactionSlugAssignAiExchange[]> => {
  let query = supabase
    .from('transaction_slug_assign_ai_exchanges')
    .select('*')
    .eq('status', 'completed')
    .not('input_tokens', 'is', null)
    .not('output_tokens', 'is', null);

  if (filters.transaction_id) {
    query = query.eq('transaction_id', filters.transaction_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list slug assign exchanges: ${error.message}`);
  }

  return (data ?? []) as TransactionSlugAssignAiExchange[];
};
