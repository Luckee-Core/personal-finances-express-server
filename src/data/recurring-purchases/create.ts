import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fallbackBillingInterval,
  isBillingIntervalConstraintError,
  normalizeBillingInterval,
} from '../../utils/recurring/normalize-billing-interval';
import type { CreateRecurringPurchaseInput, RecurringPurchase } from './types';

export const createRecurringPurchase = async (
  supabase: SupabaseClient,
  input: CreateRecurringPurchaseInput,
): Promise<RecurringPurchase> => {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }
  const { billing_interval: interval, interval_months: intervalMonths } =
    normalizeBillingInterval(input.billing_interval, input.interval_months);
  const amountCents = Math.round(Number(input.amount_cents));
  if (!Number.isFinite(amountCents) || amountCents < 0) {
    throw new Error('amount_cents must be a non-negative integer');
  }

  const insertRow = {
    name,
    vendor: input.vendor?.trim() || null,
    amount_cents: amountCents,
    billing_interval: interval,
    interval_months: intervalMonths,
    currency: (input.currency ?? 'usd').toLowerCase(),
    started_at: input.started_at ?? new Date().toISOString(),
    next_due_at: input.next_due_at ?? null,
    ends_at: input.ends_at ?? null,
    is_active: input.is_active !== false,
    notes: input.notes?.trim() || null,
  };

  let { data, error } = await supabase
    .from('recurring_purchases')
    .insert(insertRow)
    .select()
    .single();

  if (error && isBillingIntervalConstraintError(error.message)) {
    const fallback = fallbackBillingInterval(interval);
    const retry = await supabase
      .from('recurring_purchases')
      .insert({
        ...insertRow,
        billing_interval: fallback.billing_interval,
        interval_months: fallback.interval_months,
      })
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    const hint = isBillingIntervalConstraintError(error.message)
      ? ' Apply docs/supabase/005_recurring_daily_billing_interval.sql to allow daily billing.'
      : '';
    throw new Error(`Failed to create recurring purchase: ${error.message}${hint}`);
  }

  return data as RecurringPurchase;
};
