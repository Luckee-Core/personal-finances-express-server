import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateTransactionSlugAssignAiRequestInput,
  TransactionSlugAssignAiRequest,
} from './types';

/**
 * Inserts a pending slug-assign AI request row.
 */
export const createTransactionSlugAssignAiRequest = async (
  supabase: SupabaseClient,
  input: CreateTransactionSlugAssignAiRequestInput,
): Promise<TransactionSlugAssignAiRequest> => {
  const { data, error } = await supabase
    .from('transaction_slug_assign_ai_requests')
    .insert({
      transaction_id: input.transaction_id,
      ai_prompt_id: input.ai_prompt_id ?? null,
      prompt_type: input.prompt_type,
      provider: input.provider,
      model: input.model,
      request_payload_json: input.request_payload_json,
      system_prompt: input.system_prompt,
      user_message: input.user_message,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create slug assign request: ${error.message}`);
  }

  return data as TransactionSlugAssignAiRequest;
};
