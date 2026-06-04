import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnticipatedCost } from './types';

/**
 * Loads a single anticipated cost by id.
 */
export const getAnticipatedCostById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<AnticipatedCost | null> => {
  const { data, error } = await supabase
    .from('anticipated_costs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load anticipated cost: ${error.message}`);
  }

  return (data as AnticipatedCost | null) ?? null;
};
