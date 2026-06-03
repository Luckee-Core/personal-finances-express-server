import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateTransactionSlugAssignAiExchangeInput,
  TransactionSlugAssignAiExchange,
} from './types';

/**
 * Inserts a pending slug-assign AI exchange row.
 */
export const createTransactionSlugAssignAiExchange = async (
  supabase: SupabaseClient,
  input: CreateTransactionSlugAssignAiExchangeInput,
): Promise<TransactionSlugAssignAiExchange> => {
  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_exchanges')
    .insert({
      transaction_id: input.transaction_id,
      request_id: input.request_id,
      model_used: input.model_used,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create slug assign exchange: ${error.message}`);
  }

  return data as TransactionSlugAssignAiExchange;
};
