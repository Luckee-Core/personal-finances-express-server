import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanVendor, UpdateLoanVendorInput } from './types';

/**
 * Updates a loan vendor.
 */
export const updateLoanVendor = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateLoanVendorInput,
): Promise<LoanVendor> => {
  const patch: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }

  const { data, error } = await supabase
    .from('loan_vendors')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update loan vendor: ${error.message}`);
  }

  return data as LoanVendor;
};
