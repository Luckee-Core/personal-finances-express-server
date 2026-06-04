import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateLoanVendorInput, LoanVendor } from './types';

/**
 * Creates a loan vendor.
 */
export const createLoanVendor = async (
  supabase: SupabaseClient,
  input: CreateLoanVendorInput,
): Promise<LoanVendor> => {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }

  const { data, error } = await supabase
    .from('loan_vendors')
    .insert({ name })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create loan vendor: ${error.message}`);
  }

  return data as LoanVendor;
};
