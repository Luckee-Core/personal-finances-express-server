import type { Request, Response } from 'express';
import { deleteAnticipatedCost } from '../delete';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles DELETE /api/data/anticipated-costs/:id.
 */
export const deleteAnticipatedCostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 DELETE /api/data/anticipated-costs/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteAnticipatedCost(supabase, id);
    console.log('📤 DELETE /api/data/anticipated-costs/:id');
    sendSuccess(res, { id });
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/anticipated-costs/:id');
  }
};
