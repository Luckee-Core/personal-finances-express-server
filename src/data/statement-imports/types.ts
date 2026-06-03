export type StatementImportStatus = 'pending' | 'completed' | 'failed';

export type StatementImport = {
  id: string;
  filename: string;
  status: StatementImportStatus;
  rows_imported: number;
  rows_skipped: number;
  error_summary: string | null;
  bank_account_id: string | null;
  credit_card_id: string | null;
  created_at: string;
  updated_at: string;
};
