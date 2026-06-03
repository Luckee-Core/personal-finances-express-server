import type { Request, Response } from 'express';
import { deleteBankAccount } from '../delete';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles DELETE /api/data/bank-accounts/:id.
 */
export const deleteBankAccountHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 DELETE /api/data/bank-accounts/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteBankAccount(supabase, id);
    console.log('📤 DELETE /api/data/bank-accounts/:id');
    sendSuccess(res, null);
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/bank-accounts/:id');
  }
};
