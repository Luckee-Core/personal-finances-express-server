import type { Request, Response } from 'express';
import { getAllTransactions } from '../get-all';
import { parseTransactionFilters } from '../../../utils/transactions/parse-transaction-filters';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transactions.
 */
export const getTransactionsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/transactions');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllTransactions(supabase, parseTransactionFilters(req.query));
    console.log('📤 GET /api/data/transactions');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transactions');
  }
};
