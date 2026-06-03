import type { SupabaseClient } from '@supabase/supabase-js';
import type { StatementImport } from './types';

export type UpdateStatementImportInput = {
  status?: StatementImport['status'];
  rows_imported?: number;
  rows_skipped?: number;
  error_summary?: string | null;
};

/**
 * Updates a statement import row by id.
 */
export const updateStatementImport = async (
  supabase: SupabaseClient,
  id: string,
  patch: UpdateStatementImportInput,
): Promise<StatementImport> => {
  console.log('💾 updateStatementImport', { id, status: patch.status });
  const { data, error } = await supabase
    .from('statement_imports')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update import record: ${error.message}`);
  }

  return data as StatementImport;
};
