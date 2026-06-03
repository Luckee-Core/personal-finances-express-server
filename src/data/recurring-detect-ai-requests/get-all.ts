import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringDetectAiRequest } from './types';

export type RecurringDetectAiRequestFilters = {
  slug?: string;
  exchange_id?: string;
};

/**
 * Lists slug-assign AI request rows with optional filters.
 */
export const getAllRecurringDetectAiRequests = async (
  supabase: SupabaseClient,
  filters: RecurringDetectAiRequestFilters = {},
): Promise<RecurringDetectAiRequest[]> => {
  let q = supabase
    .from('recurring_detect_ai_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.slug) {
    q = q.eq('slug', filters.slug);
  }
  if (filters.exchange_id) {
    q = q.eq('exchange_id', filters.exchange_id);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list recurring detect requests: ${error.message}`);
  }

  return (data ?? []) as RecurringDetectAiRequest[];
};
