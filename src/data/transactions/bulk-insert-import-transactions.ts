import type { SupabaseClient } from '@supabase/supabase-js';

export type ImportTransactionInsert = {
  bank_account_id?: string | null;
  credit_card_id?: string | null;
  statement_import_id: string;
  posted_on: string;
  amount_cents: number;
  description: string;
  source: 'import';
};

/**
 * Bulk inserts imported transaction rows.
 */
export const bulkInsertImportTransactions = async (
  supabase: SupabaseClient,
  rows: ImportTransactionInsert[],
): Promise<void> => {
  if (rows.length === 0) return;

  console.log('💾 bulkInsertImportTransactions', { count: rows.length });
  const { error } = await supabase.from('transactions').insert(rows);
  if (error) {
    throw new Error(`Failed to insert transactions: ${error.message}`);
  }
};
