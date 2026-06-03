import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransactionSlugAssignAiExchange } from './types';

/**
 * Fetches one slug-assign AI exchange by id.
 */
export const getTransactionSlugAssignAiExchangeById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<TransactionSlugAssignAiExchange | null> => {
  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_exchanges')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch slug assign exchange: ${error.message}`);
  }

  return data as TransactionSlugAssignAiExchange | null;
};
