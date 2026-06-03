export type TransactionSource = 'manual' | 'import';

export type Transaction = {
  id: string;
  bank_account_id: string | null;
  credit_card_id: string | null;
  category_id: string | null;
  statement_import_id: string | null;
  recurring_purchase_id: string | null;
  posted_on: string;
  amount_cents: number;
  description: string;
  source: TransactionSource;
  slug: string | null;
  last_slug_assign_exchange_id: string | null;
  last_category_assign_exchange_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionInput = {
  bank_account_id?: string | null;
  credit_card_id?: string | null;
  category_id?: string | null;
  statement_import_id?: string | null;
  recurring_purchase_id?: string | null;
  posted_on: string;
  amount_cents: number;
  description?: string;
  source?: TransactionSource;
};

export type UpdateTransactionInput = {
  bank_account_id?: string | null;
  credit_card_id?: string | null;
  category_id?: string | null;
  recurring_purchase_id?: string | null;
  posted_on?: string;
  amount_cents?: number;
  description?: string;
  slug?: string | null;
  last_slug_assign_exchange_id?: string | null;
  last_category_assign_exchange_id?: string | null;
};

export type TransactionListFilters = {
  bankAccountId?: string;
  creditCardId?: string;
  categoryId?: string;
  source?: TransactionSource;
  fromDate?: string;
  toDate?: string;
};
