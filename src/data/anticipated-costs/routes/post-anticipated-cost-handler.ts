import type { Request, Response } from 'express';
import { createAnticipatedCost } from '../create';
import type { CreateAnticipatedCostInput } from '../types';
import {
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles POST /api/data/anticipated-costs.
 */
export const postAnticipatedCostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 POST /api/data/anticipated-costs');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const body = req.body as CreateAnticipatedCostInput;
  if (!body?.name?.trim()) {
    sendClientError(res, 'name is required');
    return;
  }

  try {
    const created = await createAnticipatedCost(supabase, body);
    console.log('📤 POST /api/data/anticipated-costs');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/anticipated-costs');
  }
};
