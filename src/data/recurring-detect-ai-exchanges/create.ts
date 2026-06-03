import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateRecurringDetectAiExchangeInput,
  RecurringDetectAiExchange,
} from './types';

/**
 * Inserts a pending slug-assign AI exchange row.
 */
export const createRecurringDetectAiExchange = async (
  supabase: SupabaseClient,
  input: CreateRecurringDetectAiExchangeInput,
): Promise<RecurringDetectAiExchange> => {
  const { data, error } = await supabase
    .from('recurring_detect_ai_exchanges')
    .insert({
      slug: input.slug,
      request_id: input.request_id,
      model_used: input.model_used,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create recurring detect exchange: ${error.message}`);
  }

  return data as RecurringDetectAiExchange;
};
