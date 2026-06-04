-- Migrate loans.vendor TEXT → loan_vendors + loans.loan_vendor_id (legacy installs only).
-- Safe to run if you already applied 017 with loan_vendors: skips vendor backfill when column is gone.
-- Fresh installs: use 017_loans.sql only; this file is optional.

CREATE TABLE IF NOT EXISTS public.loan_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_vendors_name_lower
  ON public.loan_vendors (lower(trim(name)));

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS loan_vendor_id UUID REFERENCES public.loan_vendors(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'loans'
      AND column_name = 'vendor'
  ) THEN
    INSERT INTO public.loan_vendors (name)
    SELECT DISTINCT trim(l.vendor)
    FROM public.loans l
    WHERE l.vendor IS NOT NULL
      AND trim(l.vendor) <> ''
      AND NOT EXISTS (
        SELECT 1
        FROM public.loan_vendors lv
        WHERE lower(trim(lv.name)) = lower(trim(l.vendor))
      );

    UPDATE public.loans l
    SET loan_vendor_id = lv.id
    FROM public.loan_vendors lv
    WHERE l.vendor IS NOT NULL
      AND trim(l.vendor) <> ''
      AND lower(trim(lv.name)) = lower(trim(l.vendor))
      AND l.loan_vendor_id IS NULL;

    ALTER TABLE public.loans DROP COLUMN vendor;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_loans_loan_vendor_id ON public.loans(loan_vendor_id);
