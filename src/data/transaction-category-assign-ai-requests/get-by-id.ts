import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionCategoryAssignAiRequest } from './types';

/**
 * Fetches one slug-assign AI request by id.
 */
export const getTransactionCategoryAssignAiRequestById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionCategoryAssignAiRequest | null> => {
  const { data, error } = await supabase
    .from('transaction_category_assign_ai_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch category assign request: ${error.message}`);
  }

  return data as TransactionCategoryAssignAiRequest | null;
};
