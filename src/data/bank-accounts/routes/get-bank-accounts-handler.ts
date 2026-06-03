import type { Request, Response } from 'express';
import { getAllBankAccounts } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/bank-accounts.
 */
export const getBankAccountsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/bank-accounts');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllBankAccounts(supabase);
    console.log('📤 GET /api/data/bank-accounts');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/bank-accounts');
  }
};
