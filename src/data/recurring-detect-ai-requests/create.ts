import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateRecurringDetectAiRequestInput,
  RecurringDetectAiRequest,
} from './types';

/**
 * Inserts a pending slug-assign AI request row.
 */
export const createRecurringDetectAiRequest = async (
  supabase: SupabaseClient,
  input: CreateRecurringDetectAiRequestInput,
): Promise<RecurringDetectAiRequest> => {
  const { data, error } = await supabase
    .from('recurring_detect_ai_requests')
    .insert({
      slug: input.slug,
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
    throw new Error(`Failed to create recurring detect request: ${error.message}`);
  }

  return data as RecurringDetectAiRequest;
};
