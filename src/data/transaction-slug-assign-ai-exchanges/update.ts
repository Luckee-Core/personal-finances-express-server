import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TransactionSlugAssignAiExchange,
  UpdateTransactionSlugAssignAiExchangeInput,
} from './types';

/**
 * Updates a slug-assign AI exchange row.
 */
export const updateTransactionSlugAssignAiExchange = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateTransactionSlugAssignAiExchangeInput,
): Promise<TransactionSlugAssignAiExchange> => {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.response_id !== undefined) patch.response_id = input.response_id;
  if (input.input_tokens !== undefined) patch.input_tokens = input.input_tokens;
  if (input.output_tokens !== undefined) patch.output_tokens = input.output_tokens;
  if (input.total_tokens !== undefined) patch.total_tokens = input.total_tokens;
  if (input.status !== undefined) patch.status = input.status;
  if (input.error_message !== undefined) patch.error_message = input.error_message;

  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_exchanges')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update slug assign exchange: ${error.message}`);
  }

  return data as TransactionSlugAssignAiExchange;
};
