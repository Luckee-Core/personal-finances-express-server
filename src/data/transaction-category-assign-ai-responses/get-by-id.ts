import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionCategoryAssignAiResponse } from './types';

/**
 * Fetches one slug-assign AI response by id.
 */
export const getTransactionCategoryAssignAiResponseById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionCategoryAssignAiResponse | null> => {
  const { data, error } = await supabase
    .from('transaction_category_assign_ai_responses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch category assign response: ${error.message}`);
  }

  return data as TransactionCategoryAssignAiResponse | null;
};
