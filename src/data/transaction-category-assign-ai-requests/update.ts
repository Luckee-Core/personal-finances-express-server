import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TransactionCategoryAssignAiRequest,
  UpdateTransactionCategoryAssignAiRequestInput,
} from './types';

/**
 * Updates a slug-assign AI request row.
 */
export const updateTransactionCategoryAssignAiRequest = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateTransactionCategoryAssignAiRequestInput,
): Promise<TransactionCategoryAssignAiRequest> => {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.status !== undefined) patch.status = input.status;
  if (input.exchange_id !== undefined) patch.exchange_id = input.exchange_id;

  const { data, error } = await supabase
    .from('transaction_category_assign_ai_requests')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update category assign request: ${error.message}`);
  }

  return data as TransactionCategoryAssignAiRequest;
};
