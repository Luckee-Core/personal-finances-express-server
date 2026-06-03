import type { Request, Response } from 'express';
import { getAllNotRecurring } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/not-recurring.
 */
export const getNotRecurringHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/not-recurring');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllNotRecurring(supabase);
    console.log('📤 GET /api/data/not-recurring');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/not-recurring');
  }
};
