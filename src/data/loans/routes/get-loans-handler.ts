import type { Request, Response } from 'express';
import { getAllLoans } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/loans.
 */
export const getLoansHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/loans');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllLoans(supabase);
    console.log('📤 GET /api/data/loans');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/loans');
  }
};
