import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transaction, UpdateTransactionInput } from './types';

export const updateTransaction = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction> => {
  const patch: Record<string, string | number | null> = {
    updated_at: new Date().toISOString(),
  };

  if (input.bank_account_id !== undefined) {
    patch.bank_account_id = input.bank_account_id?.trim() || null;
  }
  if (input.credit_card_id !== undefined) {
    patch.credit_card_id = input.credit_card_id?.trim() || null;
  }
  if (input.category_id !== undefined) {
    patch.category_id = input.category_id;
  }
  if (input.recurring_purchase_id !== undefined) {
    patch.recurring_purchase_id = input.recurring_purchase_id;
  }
  if (input.posted_on !== undefined) {
    const postedOn = input.posted_on.trim();
    if (!postedOn) throw new Error('posted_on cannot be empty');
    patch.posted_on = postedOn;
  }
  if (input.amount_cents !== undefined) {
    const amountCents = Math.round(Number(input.amount_cents));
    if (!Number.isFinite(amountCents)) {
      throw new Error('amount_cents must be a number');
    }
    patch.amount_cents = amountCents;
  }
  if (input.description !== undefined) {
    patch.description = input.description.trim();
  }
  if (input.slug !== undefined) {
    patch.slug = input.slug;
  }
  if (input.last_slug_assign_exchange_id !== undefined) {
    patch.last_slug_assign_exchange_id = input.last_slug_assign_exchange_id;
  }
  if (input.last_category_assign_exchange_id !== undefined) {
    patch.last_category_assign_exchange_id = input.last_category_assign_exchange_id;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  return data as Transaction;
};
