import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateTransactionCategoryAssignAiResponseInput,
  TransactionCategoryAssignAiResponse,
} from './types';

/**
 * Inserts a slug-assign AI response row.
 */
export const createTransactionCategoryAssignAiResponse = async (
  supabase: SupabaseClient,
  input: CreateTransactionCategoryAssignAiResponseInput,
): Promise<TransactionCategoryAssignAiResponse> => {
  const { data, error } = await supabase
    .from('transaction_category_assign_ai_responses')
    .insert({
      request_id: input.request_id,
      model: input.model,
      status: input.status,
      raw_response: input.raw_response ?? null,
      parsed_response_json: input.parsed_response_json ?? null,
      error_message: input.error_message ?? null,
      usage_input_tokens: input.usage_input_tokens ?? null,
      usage_output_tokens: input.usage_output_tokens ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create category assign response: ${error.message}`);
  }

  return data as TransactionCategoryAssignAiResponse;
};
