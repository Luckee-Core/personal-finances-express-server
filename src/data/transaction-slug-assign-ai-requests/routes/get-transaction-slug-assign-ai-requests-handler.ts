import type { Request, Response } from 'express';
import { getAllTransactionSlugAssignAiRequests } from '../get-all';
import { requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transaction-slug-assign-ai-requests.
 */
export const getTransactionSlugAssignAiRequestsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/transaction-slug-assign-ai-requests');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const transactionId =
    typeof req.query.transaction_id === 'string' ? req.query.transaction_id : undefined;
  const exchangeId = typeof req.query.exchange_id === 'string' ? req.query.exchange_id : undefined;

  if (!transactionId && !exchangeId) {
    sendClientError(res, 'transaction_id or exchange_id query param is required');
    return;
  }

  try {
    const rows = await getAllTransactionSlugAssignAiRequests(supabase, {
      transaction_id: transactionId,
      exchange_id: exchangeId,
    });
    console.log('📤 GET /api/data/transaction-slug-assign-ai-requests');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transaction-slug-assign-ai-requests');
  }
};
