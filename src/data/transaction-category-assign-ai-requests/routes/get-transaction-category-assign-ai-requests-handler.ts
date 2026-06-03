import type { Request, Response } from 'express';
import { getAllTransactionCategoryAssignAiRequests } from '../get-all';
import { requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transaction-category-assign-ai-requests.
 */
export const getTransactionCategoryAssignAiRequestsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/transaction-category-assign-ai-requests');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const transactionId =
    typeof req.query.transaction_id === 'string' ? req.query.transaction_id : undefined;
  if (!transactionId) {
    sendClientError(res, 'transaction_id query param is required');
    return;
  }

  try {
    const rows = await getAllTransactionCategoryAssignAiRequests(supabase, {
      transaction_id: transactionId,
    });
    console.log('📤 GET /api/data/transaction-category-assign-ai-requests');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transaction-category-assign-ai-requests');
  }
};
