import type { BillingInterval } from '../../data/recurring-purchases/types';

const BILLING_INTERVALS = new Set<BillingInterval>([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
]);

export type NormalizedBillingInterval = {
  billing_interval: BillingInterval;
  interval_months: number | null;
};

const parseIntervalMonths = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(1, Math.round(value));
};

/**
 * Maps model billing_interval strings to values allowed by recurring_purchases.
 * Aliases (quarterly, biweekly, etc.) become weekly or custom + interval_months.
 */
export const normalizeBillingInterval = (
  value: unknown,
  intervalMonthsFromModel: unknown = null,
): NormalizedBillingInterval => {
  const intervalMonths = parseIntervalMonths(intervalMonthsFromModel);
  const monthly: NormalizedBillingInterval = {
    billing_interval: 'monthly',
    interval_months: null,
  };

  if (typeof value !== 'string') {
    return monthly;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'quarterly' || normalized === 'quarter') {
    return {
      billing_interval: 'custom',
      interval_months: intervalMonths ?? 3,
    };
  }
  if (
    normalized === 'biweekly' ||
    normalized === 'bi-weekly' ||
    normalized === 'fortnightly'
  ) {
    return { billing_interval: 'weekly', interval_months: null };
  }
  if (
    normalized === 'semiannual' ||
    normalized === 'semi-annual' ||
    normalized === 'biannual'
  ) {
    return {
      billing_interval: 'custom',
      interval_months: intervalMonths ?? 6,
    };
  }

  if (BILLING_INTERVALS.has(normalized as BillingInterval)) {
    const interval = normalized as BillingInterval;
    return {
      billing_interval: interval,
      interval_months: interval === 'custom' ? intervalMonths : null,
    };
  }

  return monthly;
};

const BILLING_INTERVAL_CHECK = 'recurring_purchases_billing_interval_check';

export const isBillingIntervalConstraintError = (message: string): boolean =>
  message.includes(BILLING_INTERVAL_CHECK);

/**
 * Retries with a safer interval when the DB check rejects daily (migration 005 not applied).
 */
export const fallbackBillingInterval = (
  interval: BillingInterval,
): NormalizedBillingInterval => {
  if (interval === 'daily') {
    return { billing_interval: 'weekly', interval_months: null };
  }
  if (interval === 'custom') {
    return { billing_interval: 'monthly', interval_months: null };
  }
  return { billing_interval: 'monthly', interval_months: null };
};
