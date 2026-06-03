import type { Request, Response } from 'express';
import { getTransactionSlugAssignAiResponseById } from '../get-by-id';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/transaction-slug-assign-ai-responses/:id.
 */
export const getTransactionSlugAssignAiResponseByIdHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 GET /api/data/transaction-slug-assign-ai-responses/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const row = await getTransactionSlugAssignAiResponseById(supabase, id);
    if (!row) {
      sendClientError(res, 'Not found');
      return;
    }
    console.log('📤 GET /api/data/transaction-slug-assign-ai-responses/:id');
    sendSuccess(res, row);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/transaction-slug-assign-ai-responses/:id');
  }
};
