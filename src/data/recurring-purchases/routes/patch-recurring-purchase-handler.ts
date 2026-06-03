import type { Request, Response } from 'express';
import { updateRecurringPurchase } from '../update';
import type { UpdateRecurringPurchaseInput } from '../types';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles PATCH /api/data/recurring-purchases/:id.
 */
export const patchRecurringPurchaseHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/recurring-purchases/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateRecurringPurchase(supabase, id, req.body as UpdateRecurringPurchaseInput);
    console.log('📤 PATCH /api/data/recurring-purchases/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/recurring-purchases/:id');
  }
};
