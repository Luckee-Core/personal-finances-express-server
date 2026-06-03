import type { Request, Response } from 'express';
import { getAllTransactionSlugAssignAiExchanges } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transaction-slug-assign-ai-exchanges.
 */
export const getTransactionSlugAssignAiExchangesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/transaction-slug-assign-ai-exchanges');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const transactionId =
    typeof req.query.transaction_id === 'string' ? req.query.transaction_id : undefined;

  try {
    const rows = await getAllTransactionSlugAssignAiExchanges(supabase, {
      transaction_id: transactionId,
    });
    console.log('📤 GET /api/data/transaction-slug-assign-ai-exchanges');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transaction-slug-assign-ai-exchanges');
  }
};
