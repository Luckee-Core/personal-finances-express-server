import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionCategoryAssignAiResponse } from './types';

export type TransactionCategoryAssignAiResponseFilters = {
  request_id?: string;
};

/**
 * Lists slug-assign AI response rows with optional filters.
 */
export const getAllTransactionCategoryAssignAiResponses = async (
  supabase: SupabaseClient,
  filters: TransactionCategoryAssignAiResponseFilters,
): Promise<TransactionCategoryAssignAiResponse[]> => {
  let q = supabase
    .from('transaction_category_assign_ai_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.request_id) {
    q = q.eq('request_id', filters.request_id);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list category assign responses: ${error.message}`);
  }

  return (data ?? []) as TransactionCategoryAssignAiResponse[];
};
