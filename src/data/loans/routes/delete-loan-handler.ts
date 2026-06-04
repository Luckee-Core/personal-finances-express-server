import type { Request, Response } from 'express';
import { deleteLoan } from '../delete';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles DELETE /api/data/loans/:id.
 */
export const deleteLoanHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 DELETE /api/data/loans/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteLoan(supabase, id);
    console.log('📤 DELETE /api/data/loans/:id');
    sendSuccess(res, { id });
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/loans/:id');
  }
};
