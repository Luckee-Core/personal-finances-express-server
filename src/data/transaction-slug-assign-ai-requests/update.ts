import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TransactionSlugAssignAiRequest,
  UpdateTransactionSlugAssignAiRequestInput,
} from './types';

/**
 * Updates a slug-assign AI request row.
 */
export const updateTransactionSlugAssignAiRequest = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateTransactionSlugAssignAiRequestInput,
): Promise<TransactionSlugAssignAiRequest> => {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.status !== undefined) patch.status = input.status;
  if (input.exchange_id !== undefined) patch.exchange_id = input.exchange_id;

  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_requests')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update slug assign request: ${error.message}`);
  }

  return data as TransactionSlugAssignAiRequest;
};
