import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringDetectAiResponse } from './types';

/**
 * Fetches one slug-assign AI response by id.
 */
export const getRecurringDetectAiResponseById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<RecurringDetectAiResponse | null> => {
  const { data, error } = await supabase
    .from('recurring_detect_ai_responses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch recurring detect response: ${error.message}`);
  }

  return data as RecurringDetectAiResponse | null;
};
