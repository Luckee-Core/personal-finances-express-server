import type { Request, Response } from 'express';
import { getAllRecurringDetectAiExchanges } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/recurring-detect-ai-exchanges.
 */
export const getRecurringDetectAiExchangesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/recurring-detect-ai-exchanges');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;

  try {
    const rows = await getAllRecurringDetectAiExchanges(supabase, { slug });
    console.log('📤 GET /api/data/recurring-detect-ai-exchanges');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/recurring-detect-ai-exchanges');
  }
};
