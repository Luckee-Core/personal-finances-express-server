import type { SupabaseClient } from '@supabase/supabase-js';
import type { Loan, UpdateLoanInput } from './types';

/**
 * Updates a loan record.
 */
export const updateLoan = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateLoanInput,
): Promise<Loan> => {
  const patch: Record<string, string | number | boolean | null> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }

  if (input.loan_vendor_id !== undefined) {
    patch.loan_vendor_id = input.loan_vendor_id;
  }

  if (input.balance_cents !== undefined) {
    if (!Number.isFinite(input.balance_cents) || input.balance_cents < 0) {
      throw new Error('balance_cents must be a non-negative number');
    }
    patch.balance_cents = Math.round(input.balance_cents);
  }

  if (input.monthly_payment_cents !== undefined) {
    if (!Number.isFinite(input.monthly_payment_cents) || input.monthly_payment_cents < 0) {
      throw new Error('monthly_payment_cents must be a non-negative number');
    }
    patch.monthly_payment_cents = Math.round(input.monthly_payment_cents);
  }

  if (input.is_active !== undefined) {
    patch.is_active = input.is_active;
  }

  if (input.notes !== undefined) {
    patch.notes = input.notes?.trim() || null;
  }

  const { data, error } = await supabase
    .from('loans')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update loan: ${error.message}`);
  }

  return data as Loan;
};
