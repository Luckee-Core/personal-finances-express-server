import type { Request, Response } from 'express';
import { processDetectRecurringAll } from '../process-detect-recurring-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/ai/recurring/detect (single AI pass over all slugged transactions).
 */
export const postDetectRecurringBatchHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 POST /api/ai/recurring/detect');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const body = req.body ?? {};

  try {
    const result = await processDetectRecurringAll(supabase, {
      slugs: Array.isArray(body.slugs) ? (body.slugs as string[]) : undefined,
      min_transactions:
        typeof body.min_transactions === 'number' ? body.min_transactions : undefined,
      only_unlinked: Boolean(body.only_unlinked),
      create_recurring: Boolean(body.create_recurring),
    });
    console.log('📤 POST /api/ai/recurring/detect', {
      transaction_count: result.transaction_count,
      recurring_found: result.recurring_found,
      purchases_created: result.recurring_purchases_created,
    });
    sendSuccess(res, result);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/ai/recurring/detect');
  }
};
