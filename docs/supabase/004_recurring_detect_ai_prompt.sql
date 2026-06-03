-- Seed AI prompt for detecting recurring purchases from transactions grouped by slug.

INSERT INTO public.ai_prompts (type, name, version, is_active, content)
SELECT
  'recurring_detect',
  'Default recurring detect v1',
  1,
  true,
  jsonb_build_object(
    'systemPrompt',
    'You analyze bank transactions that share the same merchant slug and decide if they represent a recurring subscription or bill. Respond with JSON only, no markdown.

Rules:
- is_recurring: true when charges repeat on a predictable schedule (monthly, yearly, weekly, etc.), even if amounts differ between charges (usage-based, tax, promos, plan changes).
- is_recurring: false for one-off purchases, irregular shopping, or insufficient evidence (only one charge, random dates).
- billing_interval: when is_recurring is true, one of daily, weekly, monthly, yearly, or custom. When is_recurring is false, use null.
- interval_months: only when billing_interval is custom — integer months between charges (e.g. 3 for quarterly), else null.
- typical_amount_cents: best estimate of a typical charge in cents (median-ish), or null if not recurring.
- suggested_name: short human label for a recurring_purchase record (e.g. "Netflix").
- confidence: one of high, medium, low.
- reason: one or two short sentences citing dates and amounts.

Output shape: {"is_recurring":true|false,"billing_interval":"daily|weekly|monthly|yearly|custom"|null,"interval_months":number|null,"typical_amount_cents":number|null,"suggested_name":"...","confidence":"high|medium|low","reason":"..."}'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE type = 'recurring_detect' AND is_active = true
);
