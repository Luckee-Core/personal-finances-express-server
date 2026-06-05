import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotRecurring } from './types';

/**
 * Lists all not-recurring slug records.
 */
export const getAllNotRecurring = async (supabase: SupabaseClient): Promise<NotRecurring[]> => {
  const { data, error } = await supabase
    .from('not_recurring')
    .select('*')
    .order('slug');

  if (error) {
    throw new Error(`Failed to fetch not_recurring: ${error.message}`);
  }

  return (data ?? []) as NotRecurring[];
};
