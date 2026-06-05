import type { Request, Response } from 'express';
import { deleteCreditCard } from '../delete';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles DELETE /api/data/credit-cards/:id.
 */
export const deleteCreditCardHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 DELETE /api/data/credit-cards/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteCreditCard(supabase, id);
    console.log('📤 DELETE /api/data/credit-cards/:id');
    sendSuccess(res, null);
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/credit-cards/:id');
  }
};
