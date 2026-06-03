-- Slugs excluded from recurring AI detection (user-marked as not recurring).

CREATE TABLE IF NOT EXISTS public.not_recurring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS not_recurring_slug_key ON public.not_recurring (slug);
