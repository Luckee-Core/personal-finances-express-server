import type { SupabaseClient } from '@supabase/supabase-js';
import type { StatementImport } from './types';

export const getAllStatementImports = async (
  supabase: SupabaseClient,
): Promise<StatementImport[]> => {
  const { data, error } = await supabase
    .from('statement_imports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch statement imports: ${error.message}`);
  }

  return (data ?? []) as StatementImport[];
};
