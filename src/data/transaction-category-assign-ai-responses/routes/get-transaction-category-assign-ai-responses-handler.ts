import type { Request, Response } from 'express';
import { getAllTransactionCategoryAssignAiResponses } from '../get-all';
import { requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transaction-category-assign-ai-responses.
 */
export const getTransactionCategoryAssignAiResponsesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/transaction-category-assign-ai-responses');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const requestId = typeof req.query.request_id === 'string' ? req.query.request_id : undefined;
  if (!requestId) {
    sendClientError(res, 'request_id query param is required');
    return;
  }

  try {
    const rows = await getAllTransactionCategoryAssignAiResponses(supabase, {
      request_id: requestId,
    });
    console.log('📤 GET /api/data/transaction-category-assign-ai-responses');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transaction-category-assign-ai-responses');
  }
};
