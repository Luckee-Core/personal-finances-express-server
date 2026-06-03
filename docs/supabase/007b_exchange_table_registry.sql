-- Catalog of domain *_exchanges tables for AI cost display and future rollups.

CREATE TABLE IF NOT EXISTS public.exchange_table_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logical_key TEXT NOT NULL,
  table_name TEXT NOT NULL,
  occurred_at_column TEXT NOT NULL DEFAULT 'created_at',
  input_tokens_column TEXT NOT NULL DEFAULT 'input_tokens',
  output_tokens_column TEXT NOT NULL DEFAULT 'output_tokens',
  model_column TEXT DEFAULT 'model_used',
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exchange_table_registry_enabled
  ON public.exchange_table_registry (enabled, sort_order);

INSERT INTO public.exchange_table_registry (logical_key, table_name, sort_order, notes)
SELECT 'transaction_slug_assign', 'transaction_slug_assign_ai_exchanges', 10, 'Per-transaction slug assignment'
WHERE NOT EXISTS (SELECT 1 FROM public.exchange_table_registry WHERE logical_key = 'transaction_slug_assign');

INSERT INTO public.exchange_table_registry (logical_key, table_name, sort_order, notes)
SELECT 'transaction_category_assign', 'transaction_category_assign_ai_exchanges', 20, 'Per-transaction category assignment'
WHERE NOT EXISTS (SELECT 1 FROM public.exchange_table_registry WHERE logical_key = 'transaction_category_assign');

INSERT INTO public.exchange_table_registry (logical_key, table_name, sort_order, notes)
SELECT 'recurring_detect', 'recurring_detect_ai_exchanges', 30, 'Per-slug recurring detection'
WHERE NOT EXISTS (SELECT 1 FROM public.exchange_table_registry WHERE logical_key = 'recurring_detect');
