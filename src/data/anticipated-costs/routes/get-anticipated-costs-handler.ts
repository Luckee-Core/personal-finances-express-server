import type { Request, Response } from 'express';
import { getAllAnticipatedCosts } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/anticipated-costs.
 */
export const getAnticipatedCostsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/anticipated-costs');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllAnticipatedCosts(supabase);
    console.log('📤 GET /api/data/anticipated-costs');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/anticipated-costs');
  }
};
