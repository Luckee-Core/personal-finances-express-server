-- Planned future expenses (lease, internet, phone, etc.)
-- Schedule: timeframe_interval + timeframe_every + timeframe_count
--   NULLs = one payment on due_on
--   e.g. every 2 months × 6 payments starting at due_on

CREATE TABLE IF NOT EXISTS public.anticipated_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  due_on DATE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  notes TEXT,
  timeframe_interval TEXT
    CHECK (timeframe_interval IS NULL OR timeframe_interval IN ('weekly', 'monthly', 'yearly')),
  timeframe_every INTEGER
    CHECK (timeframe_every IS NULL OR (timeframe_every >= 1 AND timeframe_every <= 52)),
  timeframe_count INTEGER
    CHECK (
      (timeframe_interval IS NULL AND timeframe_every IS NULL AND timeframe_count IS NULL)
      OR (
        timeframe_interval IS NOT NULL
        AND timeframe_every IS NOT NULL
        AND timeframe_count IS NOT NULL
        AND timeframe_every >= 1
        AND timeframe_every <= 52
        AND timeframe_count >= 1
        AND timeframe_count <= 600
      )
    ),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anticipated_costs_due_on
  ON public.anticipated_costs(due_on);

CREATE INDEX IF NOT EXISTS idx_anticipated_costs_status
  ON public.anticipated_costs(status);
