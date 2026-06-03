import type { Request, Response } from 'express';
import { getAllRecurringPurchases } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/recurring-purchases.
 */
export const getRecurringPurchasesHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/recurring-purchases');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllRecurringPurchases(supabase);
    console.log('📤 GET /api/data/recurring-purchases');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/recurring-purchases');
  }
};
