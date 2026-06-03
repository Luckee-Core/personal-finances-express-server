import type { Request, Response } from 'express';
import { markRecurringPurchaseNotRecurring } from '../mark-not-recurring';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles POST /api/data/recurring-purchases/:id/mark-not-recurring.
 */
export const postMarkNotRecurringHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 POST /api/data/recurring-purchases/:id/mark-not-recurring');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const result = await markRecurringPurchaseNotRecurring(supabase, id);
    console.log('📤 POST /api/data/recurring-purchases/:id/mark-not-recurring');
    sendSuccess(res, result);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/recurring-purchases/:id/mark-not-recurring');
  }
};
