import type { SupabaseClient } from '@supabase/supabase-js';
import type { StatementImport } from './types';

export const getStatementImportById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<StatementImport | null> => {
  const { data, error } = await supabase
    .from('statement_imports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch statement import: ${error.message}`);
  }

  return data as StatementImport | null;
};
