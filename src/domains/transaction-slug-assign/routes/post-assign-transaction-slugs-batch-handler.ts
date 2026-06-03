import type { Request, Response } from 'express';
import { processAssignTransactionSlugsBatch } from '../process-assign-transaction-slugs-batch';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/ai/transactions/assign-slugs.
 */
export const postAssignTransactionSlugsBatchHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 POST /api/ai/transactions/assign-slugs');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const body = req.body ?? {};
    const rawLimit = body.limit;
    const limit =
      typeof rawLimit === 'number' && rawLimit > 0
        ? rawLimit
        : typeof rawLimit === 'string' && Number(rawLimit) > 0
          ? Number(rawLimit)
          : undefined;

    const result = await processAssignTransactionSlugsBatch(supabase, {
      transaction_ids: Array.isArray(body.transaction_ids)
        ? (body.transaction_ids as string[])
        : undefined,
      only_unslagged: Boolean(body.only_unslagged),
      force: Boolean(body.force),
      limit,
    });
    console.log('📤 POST /api/ai/transactions/assign-slugs');
    sendSuccess(res, result);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/ai/transactions/assign-slugs');
  }
};
