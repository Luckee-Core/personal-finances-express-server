import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BillingInterval,
  RecurringPurchase,
  UpdateRecurringPurchaseInput,
} from './types';

const ALLOWED_INTERVALS = new Set<BillingInterval>([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
]);

export const updateRecurringPurchase = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateRecurringPurchaseInput,
): Promise<RecurringPurchase> => {
  const patch: Record<string, string | number | boolean | null> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }
  if (input.vendor !== undefined) {
    patch.vendor = input.vendor?.trim() || null;
  }
  if (input.amount_cents !== undefined) {
    const amountCents = Math.round(Number(input.amount_cents));
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      throw new Error('amount_cents must be a non-negative integer');
    }
    patch.amount_cents = amountCents;
  }
  if (input.billing_interval !== undefined) {
    if (!ALLOWED_INTERVALS.has(input.billing_interval)) {
      throw new Error(`Invalid billing_interval: ${input.billing_interval}`);
    }
    patch.billing_interval = input.billing_interval;
  }
  if (input.interval_months !== undefined) {
    patch.interval_months = input.interval_months;
  }
  if (input.currency !== undefined) {
    patch.currency = input.currency.toLowerCase();
  }
  if (input.started_at !== undefined) {
    patch.started_at = input.started_at;
  }
  if (input.next_due_at !== undefined) {
    patch.next_due_at = input.next_due_at;
  }
  if (input.ends_at !== undefined) {
    patch.ends_at = input.ends_at;
  }
  if (input.is_active !== undefined) {
    patch.is_active = input.is_active;
  }
  if (input.notes !== undefined) {
    patch.notes = input.notes?.trim() || null;
  }

  const { data, error } = await supabase
    .from('recurring_purchases')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update recurring purchase: ${error.message}`);
  }

  return data as RecurringPurchase;
};
