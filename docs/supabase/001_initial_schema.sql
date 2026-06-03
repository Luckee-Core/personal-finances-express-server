-- Personal Finances — initial schema
-- Apply in Supabase SQL editor or via migration tool.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recurring_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vendor TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  billing_interval TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_interval IN ('monthly', 'yearly', 'weekly', 'custom')),
  interval_months INTEGER,
  currency TEXT NOT NULL DEFAULT 'usd',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_due_at DATE,
  ends_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.statement_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  rows_imported INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  statement_import_id UUID REFERENCES public.statement_imports(id) ON DELETE SET NULL,
  recurring_purchase_id UUID REFERENCES public.recurring_purchases(id) ON DELETE SET NULL,
  posted_on DATE NOT NULL,
  amount_cents INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'import')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_posted_on ON public.transactions(posted_on DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account_id ON public.transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_statement_import_id ON public.transactions(statement_import_id);

INSERT INTO public.bank_accounts (name, account_type)
SELECT 'Primary Checking', 'checking'
WHERE NOT EXISTS (SELECT 1 FROM public.bank_accounts LIMIT 1);

INSERT INTO public.categories (name, color)
SELECT v.name, v.color
FROM (VALUES
  ('Groceries', '#22c55e'),
  ('Dining', '#f97316'),
  ('Transport', '#3b82f6'),
  ('Utilities', '#8b5cf6'),
  ('Other', '#6b7280')
) AS v(name, color)
WHERE NOT EXISTS (SELECT 1 FROM public.categories LIMIT 1);
