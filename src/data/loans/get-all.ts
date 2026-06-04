import type { SupabaseClient } from '@supabase/supabase-js';
import type { Loan } from './types';

/**
 * Loads all loans ordered by name.
 */
export const getAllLoans = async (supabase: SupabaseClient): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to load loans: ${error.message}`);
  }

  return (data ?? []) as Loan[];
};
