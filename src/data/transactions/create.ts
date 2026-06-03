import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateTransactionInput, Transaction, TransactionSource } from './types';

const ALLOWED_SOURCES = new Set<TransactionSource>(['manual', 'import']);

export const createTransaction = async (
  supabase: SupabaseClient,
  input: CreateTransactionInput,
): Promise<Transaction> => {
  const bankAccountId = input.bank_account_id?.trim() || null;
  const creditCardId = input.credit_card_id?.trim() || null;
  if (Boolean(bankAccountId) === Boolean(creditCardId)) {
    throw new Error('Exactly one of bank_account_id or credit_card_id is required');
  }

  const postedOn = input.posted_on?.trim() ?? '';
  if (!postedOn) {
    throw new Error('posted_on is required');
  }
  const amountCents = Math.round(Number(input.amount_cents));
  if (!Number.isFinite(amountCents)) {
    throw new Error('amount_cents must be a number');
  }
  const source = (input.source ?? 'manual') as TransactionSource;
  if (!ALLOWED_SOURCES.has(source)) {
    throw new Error(`Invalid source: ${source}`);
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      bank_account_id: bankAccountId,
      credit_card_id: creditCardId,
      category_id: input.category_id ?? null,
      statement_import_id: input.statement_import_id ?? null,
      recurring_purchase_id: input.recurring_purchase_id ?? null,
      posted_on: postedOn,
      amount_cents: amountCents,
      description: input.description?.trim() ?? '',
      source,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data as Transaction;
};
