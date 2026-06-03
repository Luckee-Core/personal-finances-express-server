import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringDetectAiRequest } from './types';

/**
 * Fetches one slug-assign AI request by id.
 */
export const getRecurringDetectAiRequestById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<RecurringDetectAiRequest | null> => {
  const { data, error } = await supabase
    .from('recurring_detect_ai_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch recurring detect request: ${error.message}`);
  }

  return data as RecurringDetectAiRequest | null;
};
