import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateTransactionCategoryAssignAiExchangeInput,
  TransactionCategoryAssignAiExchange,
} from './types';

/**
 * Inserts a pending slug-assign AI exchange row.
 */
export const createTransactionCategoryAssignAiExchange = async (
  supabase: SupabaseClient,
  input: CreateTransactionCategoryAssignAiExchangeInput,
): Promise<TransactionCategoryAssignAiExchange> => {
  const { data, error } = await supabase
    .from('transaction_category_assign_ai_exchanges')
    .insert({
      transaction_id: input.transaction_id,
      request_id: input.request_id,
      model_used: input.model_used,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create category assign exchange: ${error.message}`);
  }

  return data as TransactionCategoryAssignAiExchange;
};
