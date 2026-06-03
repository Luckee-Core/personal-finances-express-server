import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringDetectAiExchange } from './types';

export type RecurringDetectAiExchangeFilters = {
  slug?: string;
};

/**
 * Lists recurring-detect AI exchanges; all completed rows when slug omitted.
 */
export const getAllRecurringDetectAiExchanges = async (
  supabase: SupabaseClient,
  filters: RecurringDetectAiExchangeFilters = {},
): Promise<RecurringDetectAiExchange[]> => {
  let query = supabase
    .from('recurring_detect_ai_exchanges')
    .select('*')
    .eq('status', 'completed')
    .not('input_tokens', 'is', null)
    .not('output_tokens', 'is', null);

  if (filters.slug) {
    query = query.eq('slug', filters.slug);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list recurring detect exchanges: ${error.message}`);
  }

  return (data ?? []) as RecurringDetectAiExchange[];
};
