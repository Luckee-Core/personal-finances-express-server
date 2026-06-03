import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionSlugAssignAiRequest } from './types';

/**
 * Fetches one slug-assign AI request by id.
 */
export const getTransactionSlugAssignAiRequestById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionSlugAssignAiRequest | null> => {
  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch slug assign request: ${error.message}`);
  }

  return data as TransactionSlugAssignAiRequest | null;
};
