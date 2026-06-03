import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionCategoryAssignAiExchange } from './types';

/**
 * Fetches one slug-assign AI exchange by id.
 */
export const getTransactionCategoryAssignAiExchangeById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionCategoryAssignAiExchange | null> => {
  const { data, error } = await supabase
    .from('transaction_category_assign_ai_exchanges')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch category assign exchange: ${error.message}`);
  }

  return data as TransactionCategoryAssignAiExchange | null;
};
