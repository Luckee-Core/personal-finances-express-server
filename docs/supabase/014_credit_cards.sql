-- Credit cards for CSV statement imports (separate from bank_accounts).

CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issuer TEXT,
  last_four TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.statement_imports
  ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  ALTER COLUMN bank_account_id DROP NOT NULL;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE RESTRICT;

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_account_xor_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_account_xor_check CHECK (
    (bank_account_id IS NOT NULL AND credit_card_id IS NULL)
    OR (bank_account_id IS NULL AND credit_card_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_transactions_credit_card_id ON public.transactions(credit_card_id);
