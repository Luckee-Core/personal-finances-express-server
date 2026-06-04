import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnticipatedCost } from './types';

/**
 * Loads all anticipated costs ordered by due date then name.
 */
export const getAllAnticipatedCosts = async (
  supabase: SupabaseClient,
): Promise<AnticipatedCost[]> => {
  const { data, error } = await supabase
    .from('anticipated_costs')
    .select('*')
    .order('due_on', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to load anticipated costs: ${error.message}`);
  }

  return (data ?? []) as AnticipatedCost[];
};
