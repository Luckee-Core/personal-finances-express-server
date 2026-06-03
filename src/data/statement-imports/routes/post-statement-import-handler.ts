import type { Request, Response } from 'express';
import { processStatementImport } from '../../../services/statement-import/process-statement-import';
import { requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/statement-imports (multipart CSV upload).
 */
export const postStatementImportHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/statement-imports');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const file = req.file;
  const bankAccountId =
    typeof req.body.bank_account_id === 'string' ? req.body.bank_account_id.trim() : '';
  const creditCardId =
    typeof req.body.credit_card_id === 'string' ? req.body.credit_card_id.trim() : '';

  if (!file) {
    sendClientError(res, 'file is required');
    return;
  }
  if (Boolean(bankAccountId) === Boolean(creditCardId)) {
    sendClientError(res, 'Exactly one of bank_account_id or credit_card_id is required');
    return;
  }

  try {
    const result = await processStatementImport({
      supabase,
      file: file.buffer,
      filename: file.originalname,
      bankAccountId: bankAccountId || undefined,
      creditCardId: creditCardId || undefined,
    });

    if (result.import.status !== 'completed') {
      const message =
        result.import.error_summary ??
        result.errors[0] ??
        'Statement import failed';
      console.error('❌ POST /api/data/statement-imports import failed:', message, result.errors);
      sendClientError(res, message);
      return;
    }

    console.log('📤 POST /api/data/statement-imports');
    sendSuccess(res, {
      import: result.import,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      errors: result.errors,
    });
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/statement-imports');
  }
};
