import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringDetectAiExchange } from './types';

/**
 * Fetches one slug-assign AI exchange by id.
 */
export const getRecurringDetectAiExchangeById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<RecurringDetectAiExchange | null> => {
  const { data, error } = await supabase
    .from('recurring_detect_ai_exchanges')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch recurring detect exchange: ${error.message}`);
  }

  return data as RecurringDetectAiExchange | null;
};
