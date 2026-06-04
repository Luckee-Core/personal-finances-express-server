-- Loan vendors (lenders) and loans.

CREATE TABLE IF NOT EXISTS public.loan_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_vendors_name_lower
  ON public.loan_vendors (lower(trim(name)));

CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  loan_vendor_id UUID REFERENCES public.loan_vendors(id) ON DELETE SET NULL,
  balance_cents INTEGER NOT NULL CHECK (balance_cents >= 0),
  monthly_payment_cents INTEGER NOT NULL CHECK (monthly_payment_cents >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_is_active ON public.loans(is_active);
CREATE INDEX IF NOT EXISTS idx_loans_loan_vendor_id ON public.loans(loan_vendor_id);
