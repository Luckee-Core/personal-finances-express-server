import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateLoanInput, Loan } from './types';

const parseNonNegativeCents = (value: number, field: string): number => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
  return Math.round(value);
};

/**
 * Creates a loan record.
 */
export const createLoan = async (
  supabase: SupabaseClient,
  input: CreateLoanInput,
): Promise<Loan> => {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }

  const { data, error } = await supabase
    .from('loans')
    .insert({
      name,
      loan_vendor_id: input.loan_vendor_id ?? null,
      balance_cents: parseNonNegativeCents(input.balance_cents, 'balance_cents'),
      monthly_payment_cents: parseNonNegativeCents(
        input.monthly_payment_cents,
        'monthly_payment_cents',
      ),
      is_active: input.is_active ?? true,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create loan: ${error.message}`);
  }

  return data as Loan;
};
