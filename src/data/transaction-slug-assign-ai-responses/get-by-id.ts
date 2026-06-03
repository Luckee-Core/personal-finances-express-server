import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionSlugAssignAiResponse } from './types';

/**
 * Fetches one slug-assign AI response by id.
 */
export const getTransactionSlugAssignAiResponseById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionSlugAssignAiResponse | null> => {
  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_responses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch slug assign response: ${error.message}`);
  }

  return data as TransactionSlugAssignAiResponse | null;
};
