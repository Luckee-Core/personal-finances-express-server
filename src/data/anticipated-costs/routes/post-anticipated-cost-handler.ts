import type { Request, Response } from 'express';
import { createAnticipatedCost } from '../create';
import type { CreateAnticipatedCostInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

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

  try {
    const created = await createAnticipatedCost(
      supabase,
      req.body as CreateAnticipatedCostInput,
    );
    console.log('📤 POST /api/data/anticipated-costs');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/anticipated-costs');
  }
};
