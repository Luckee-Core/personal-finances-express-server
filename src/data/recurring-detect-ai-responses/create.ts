import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateRecurringDetectAiResponseInput,
  RecurringDetectAiResponse,
} from './types';

/**
 * Inserts a slug-assign AI response row.
 */
export const createRecurringDetectAiResponse = async (
  supabase: SupabaseClient,
  input: CreateRecurringDetectAiResponseInput,
): Promise<RecurringDetectAiResponse> => {
  const { data, error } = await supabase
    .from('recurring_detect_ai_responses')
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
    throw new Error(`Failed to create recurring detect response: ${error.message}`);
  }

  return data as RecurringDetectAiResponse;
};
