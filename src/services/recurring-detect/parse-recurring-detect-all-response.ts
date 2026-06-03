import type { BillingInterval } from '../../data/recurring-purchases/types';
import { extractJsonObject } from '../../utils/ai/extract-json-object';
import { normalizeBillingInterval } from '../../utils/recurring/normalize-billing-interval';

export type ParsedRecurringCharge = {
  slug: string;
  suggested_name: string;
  billing_interval: BillingInterval;
  interval_months: number | null;
  typical_amount_cents: number;
  amount_min_cents: number | null;
  amount_max_cents: number | null;
  confidence: string;
  reason: string;
  transaction_ids: string[];
};

const parseCents = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value));
};

const parseCharge = (raw: unknown): ParsedRecurringCharge | null => {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
  if (!slug) return null;

  const typical = parseCents(row.typical_amount_cents);
  if (typical === null) return null;

  const { billing_interval: billingInterval, interval_months: intervalMonths } =
    normalizeBillingInterval(row.billing_interval, row.interval_months);

  const transactionIds = Array.isArray(row.transaction_ids)
    ? row.transaction_ids
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
        .map((id) => id.trim())
    : [];

  return {
    slug,
    suggested_name:
      typeof row.suggested_name === 'string' && row.suggested_name.trim()
        ? row.suggested_name.trim()
        : slug,
    billing_interval: billingInterval,
    interval_months: billingInterval === 'custom' ? intervalMonths : null,
    typical_amount_cents: typical,
    amount_min_cents: parseCents(row.amount_min_cents),
    amount_max_cents: parseCents(row.amount_max_cents),
    confidence: typeof row.confidence === 'string' ? row.confidence : 'medium',
    reason: typeof row.reason === 'string' ? row.reason : '',
    transaction_ids: transactionIds,
  };
};

/**
 * Parses the model JSON for full-ledger recurring detection.
 */
export const parseRecurringDetectAllResponse = (raw: string): ParsedRecurringCharge[] => {
  const parsed = extractJsonObject(raw) as Record<string, unknown>;
  const list = parsed.recurring_charges;
  if (!Array.isArray(list)) {
    return [];
  }

  const charges: ParsedRecurringCharge[] = [];
  for (const item of list) {
    const charge = parseCharge(item);
    if (charge) {
      charges.push(charge);
    }
  }
  return charges;
};
