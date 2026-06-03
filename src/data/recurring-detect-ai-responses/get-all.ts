import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringDetectAiResponse } from './types';

export type RecurringDetectAiResponseFilters = {
  request_id?: string;
};

/**
 * Lists slug-assign AI response rows with optional filters.
 */
export const getAllRecurringDetectAiResponses = async (
  supabase: SupabaseClient,
  filters: RecurringDetectAiResponseFilters = {},
): Promise<RecurringDetectAiResponse[]> => {
  let q = supabase
    .from('recurring_detect_ai_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.request_id) {
    q = q.eq('request_id', filters.request_id);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list recurring detect responses: ${error.message}`);
  }

  return (data ?? []) as RecurringDetectAiResponse[];
};
