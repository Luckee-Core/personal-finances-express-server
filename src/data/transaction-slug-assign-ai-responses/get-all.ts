import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionSlugAssignAiResponse } from './types';

export type TransactionSlugAssignAiResponseFilters = {
  request_id?: string;
};

/**
 * Lists slug-assign AI response rows with optional filters.
 */
export const getAllTransactionSlugAssignAiResponses = async (
  supabase: SupabaseClient,
  filters: TransactionSlugAssignAiResponseFilters,
): Promise<TransactionSlugAssignAiResponse[]> => {
  let q = supabase
    .from('transaction_slug_assign_ai_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.request_id) {
    q = q.eq('request_id', filters.request_id);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list slug assign responses: ${error.message}`);
  }

  return (data ?? []) as TransactionSlugAssignAiResponse[];
};
