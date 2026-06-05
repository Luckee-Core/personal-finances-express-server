import type { SupabaseClient } from '@supabase/supabase-js';
import type { StatementImport, StatementImportStatus } from './types';

export type CreateImportRecordInput = {
  filename: string;
  status?: StatementImportStatus;
  bank_account_id?: string | null;
  credit_card_id?: string | null;
};

/**
 * Inserts a statement import row.
 */
export const createImportRecord = async (
  supabase: SupabaseClient,
  input: CreateImportRecordInput,
): Promise<StatementImport> => {
  const bankAccountId = input.bank_account_id?.trim() || null;
  const creditCardId = input.credit_card_id?.trim() || null;
  if (Boolean(bankAccountId) === Boolean(creditCardId)) {
    throw new Error('Exactly one of bank_account_id or credit_card_id is required');
  }

  const { data, error } = await supabase
    .from('statement_imports')
    .insert({
      filename: input.filename,
      bank_account_id: bankAccountId,
      credit_card_id: creditCardId,
      status: input.status ?? 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create statement import: ${error.message}`);
  }

  return data as StatementImport;
};
