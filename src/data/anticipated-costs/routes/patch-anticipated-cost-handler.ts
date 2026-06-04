import type { Request, Response } from 'express';
import { updateAnticipatedCost } from '../update';
import type { UpdateAnticipatedCostInput } from '../types';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles PATCH /api/data/anticipated-costs/:id.
 */
export const patchAnticipatedCostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 PATCH /api/data/anticipated-costs/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateAnticipatedCost(
      supabase,
      id,
      req.body as UpdateAnticipatedCostInput,
    );
    console.log('📤 PATCH /api/data/anticipated-costs/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/anticipated-costs/:id');
  }
};
