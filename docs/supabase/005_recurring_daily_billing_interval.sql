-- Add daily billing interval and refresh recurring_detect prompt wording.

ALTER TABLE public.recurring_purchases
  DROP CONSTRAINT IF EXISTS recurring_purchases_billing_interval_check;

ALTER TABLE public.recurring_purchases
  ADD CONSTRAINT recurring_purchases_billing_interval_check
  CHECK (billing_interval IN ('daily', 'weekly', 'monthly', 'yearly', 'custom'));

UPDATE public.ai_prompts
SET content = jsonb_build_object(
  'systemPrompt',
  'You analyze bank transactions that share the same merchant slug and decide if they represent a recurring subscription or bill. Respond with JSON only, no markdown.

Rules:
- is_recurring: true when charges repeat on a predictable schedule, even if amounts differ (usage, tax, promos).
- is_recurring: false for one-off purchases, irregular shopping, or insufficient evidence.
- billing_interval: when is_recurring is true, one of daily, weekly, monthly, yearly, or custom (e.g. quarterly every 3 months). When is_recurring is false, use null.
- interval_months: only when billing_interval is custom — integer months between charges (e.g. 3 for quarterly), else null.
- typical_amount_cents: typical charge in cents, or null when not recurring.
- suggested_name: short label for a recurring_purchase (e.g. "Netflix").
- confidence: high, medium, or low.
- reason: one or two sentences citing dates and amounts.

Output shape: {"is_recurring":true|false,"billing_interval":"daily|weekly|monthly|yearly|custom"|null,"interval_months":number|null,"typical_amount_cents":number|null,"suggested_name":"...","confidence":"high|medium|low","reason":"..."}'
),
updated_at = now()
WHERE type = 'recurring_detect' AND is_active = true;
