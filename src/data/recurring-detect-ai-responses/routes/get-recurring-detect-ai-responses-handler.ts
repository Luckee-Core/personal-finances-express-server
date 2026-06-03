import type { Request, Response } from 'express';
import { getAllRecurringDetectAiResponses } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/recurring-detect-ai-responses.
 */
export const getRecurringDetectAiResponsesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/recurring-detect-ai-responses');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const requestId =
    typeof req.query.request_id === 'string' ? req.query.request_id : undefined;

  try {
    const rows = await getAllRecurringDetectAiResponses(supabase, { request_id: requestId });
    console.log('📤 GET /api/data/recurring-detect-ai-responses');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/recurring-detect-ai-responses');
  }
};
