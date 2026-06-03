import type { Request, Response } from 'express';
import { updateTransaction } from '../update';
import type { UpdateTransactionInput } from '../types';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles PATCH /api/data/transactions/:id.
 */
export const patchTransactionHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/transactions/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateTransaction(supabase, id, req.body as UpdateTransactionInput);
    console.log('📤 PATCH /api/data/transactions/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/transactions/:id');
  }
};
