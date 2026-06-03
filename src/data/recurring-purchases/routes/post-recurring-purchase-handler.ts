import type { Request, Response } from 'express';
import { createRecurringPurchase } from '../create';
import type { CreateRecurringPurchaseInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/recurring-purchases.
 */
export const postRecurringPurchaseHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/recurring-purchases');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createRecurringPurchase(supabase, req.body as CreateRecurringPurchaseInput);
    console.log('📤 POST /api/data/recurring-purchases');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/recurring-purchases');
  }
};
