import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  RecurringDetectAiRequest,
  UpdateRecurringDetectAiRequestInput,
} from './types';

/**
 * Updates a slug-assign AI request row.
 */
export const updateRecurringDetectAiRequest = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateRecurringDetectAiRequestInput,
): Promise<RecurringDetectAiRequest> => {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.status !== undefined) patch.status = input.status;
  if (input.exchange_id !== undefined) patch.exchange_id = input.exchange_id;

  const { data, error } = await supabase
    .from('recurring_detect_ai_requests')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update recurring detect request: ${error.message}`);
  }

  return data as RecurringDetectAiRequest;
};
