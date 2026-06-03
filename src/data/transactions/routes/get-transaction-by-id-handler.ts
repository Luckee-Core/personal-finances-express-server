import type { Request, Response } from 'express';
import { getTransactionById } from '../get-by-id';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transactions/:id.
 */
export const getTransactionByIdHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/transactions/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const row = await getTransactionById(supabase, id);
    if (!row) {
      sendClientError(res, 'Transaction not found');
      return;
    }
    console.log('📤 GET /api/data/transactions/:id');
    sendSuccess(res, row);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transactions/:id');
  }
};
