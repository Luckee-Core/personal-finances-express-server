import type { BillingInterval } from '../../data/recurring-purchases/types';
import { extractJsonObject } from '../../utils/ai/extract-json-object';
import { normalizeBillingInterval } from '../../utils/recurring/normalize-billing-interval';

export type ParsedRecurringDetectResponse = {
  is_recurring: boolean;
  billing_interval: BillingInterval | null;
  interval_months: number | null;
  typical_amount_cents: number | null;
  suggested_name: string;
  confidence: string;
  reason: string;
};

/**
 * Parses and validates the model JSON response for recurring detection.
 */
export const parseRecurringDetectResponse = (raw: string): ParsedRecurringDetectResponse => {
  const parsed = extractJsonObject(raw) as Record<string, unknown>;
  const isRecurring = Boolean(parsed.is_recurring);
  const normalized = isRecurring
    ? normalizeBillingInterval(parsed.billing_interval, parsed.interval_months)
    : null;
  const billingInterval = normalized?.billing_interval ?? null;
  const intervalMonths = normalized?.interval_months ?? null;
  const typicalRaw = parsed.typical_amount_cents;
  const typicalAmountCents =
    typeof typicalRaw === 'number' && Number.isFinite(typicalRaw)
      ? Math.max(0, Math.round(typicalRaw))
      : null;

  return {
    is_recurring: isRecurring,
    billing_interval: billingInterval ?? (isRecurring ? 'monthly' : null),
    interval_months: billingInterval === 'custom' ? intervalMonths : null,
    typical_amount_cents: typicalAmountCents,
    suggested_name:
      typeof parsed.suggested_name === 'string' && parsed.suggested_name.trim()
        ? parsed.suggested_name.trim()
        : 'Recurring',
    confidence: typeof parsed.confidence === 'string' ? parsed.confidence : 'medium',
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
};
