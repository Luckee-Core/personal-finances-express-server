import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanVendor } from './types';

/**
 * Loads all loan vendors ordered by name.
 */
export const getAllLoanVendors = async (supabase: SupabaseClient): Promise<LoanVendor[]> => {
  const { data, error } = await supabase
    .from('loan_vendors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to load loan vendors: ${error.message}`);
  }

  return (data ?? []) as LoanVendor[];
};
