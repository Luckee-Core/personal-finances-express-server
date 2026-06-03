-- Run only if you already applied 001_initial_schema.sql with `accounts` / `account_id`.

ALTER TABLE IF EXISTS public.accounts RENAME TO bank_accounts;

ALTER TABLE IF EXISTS public.transactions
  RENAME COLUMN account_id TO bank_account_id;

ALTER TABLE IF EXISTS public.statement_imports
  RENAME COLUMN account_id TO bank_account_id;

ALTER INDEX IF EXISTS idx_transactions_account_id RENAME TO idx_transactions_bank_account_id;
