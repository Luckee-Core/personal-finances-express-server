import type { SupabaseClient } from '@supabase/supabase-js';
import {
  bulkInsertImportTransactions,
  selectTransactionDedupeFields,
} from '../../data/transactions';
import { createImportRecord } from '../../data/statement-imports/create-import-record';
import { updateStatementImport } from '../../data/statement-imports/update-statement-import';
import type { StatementImport } from '../../data/statement-imports/types';
import { normalizeDescription } from './config';
import { parseCsvRows } from './parse-csv-rows';

export type ProcessStatementImportInput = {
  supabase: SupabaseClient;
  file: Buffer;
  filename: string;
  bankAccountId?: string;
  creditCardId?: string;
};

export type ProcessStatementImportResult = {
  import: StatementImport;
  createdCount: number;
  skippedCount: number;
  errors: string[];
};

/**
 * Parse CSV, dedupe against existing transactions, bulk insert import rows.
 */
export const processStatementImport = async (
  input: ProcessStatementImportInput,
): Promise<ProcessStatementImportResult> => {
  const { supabase, file, filename, bankAccountId, creditCardId } = input;
  const errors: string[] = [];

  if (Boolean(bankAccountId) === Boolean(creditCardId)) {
    throw new Error('Exactly one of bankAccountId or creditCardId is required');
  }

  const importRecord = await createImportRecord(supabase, {
    filename,
    bank_account_id: bankAccountId ?? null,
    credit_card_id: creditCardId ?? null,
    status: 'pending',
  });

  try {
    const parsedRows = parseCsvRows(file);
    if (parsedRows.length === 0) {
      throw new Error('No valid rows found in CSV');
    }

    const existingRows = await selectTransactionDedupeFields(
      supabase,
      bankAccountId ? { bankAccountId } : { creditCardId: creditCardId! },
    );

    const existingKeys = new Set(
      existingRows.map(
        (row) =>
          `${row.posted_on}|${row.amount_cents}|${normalizeDescription(row.description ?? '')}`,
      ),
    );

    const toInsert: Parameters<typeof bulkInsertImportTransactions>[1] = [];

    let skippedCount = 0;

    for (const row of parsedRows) {
      const key = `${row.posted_on}|${row.amount_cents}|${normalizeDescription(row.description)}`;
      if (existingKeys.has(key)) {
        skippedCount += 1;
        continue;
      }
      existingKeys.add(key);
      toInsert.push({
        bank_account_id: bankAccountId ?? null,
        credit_card_id: creditCardId ?? null,
        statement_import_id: importRecord.id,
        posted_on: row.posted_on,
        amount_cents: row.amount_cents,
        description: row.description,
        source: 'import',
      });
    }

    await bulkInsertImportTransactions(supabase, toInsert);

    const updatedImport = await updateStatementImport(supabase, importRecord.id, {
      status: 'completed',
      rows_imported: toInsert.length,
      rows_skipped: skippedCount,
    });

    return {
      import: updatedImport,
      createdCount: toInsert.length,
      skippedCount,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown import error';
    console.error('[statement-import] failed:', message, error);
    errors.push(message);

    const failedImport = await updateStatementImport(supabase, importRecord.id, {
      status: 'failed',
      error_summary: message,
    }).catch(() => importRecord);

    return {
      import: failedImport,
      createdCount: 0,
      skippedCount: 0,
      errors,
    };
  }
};
