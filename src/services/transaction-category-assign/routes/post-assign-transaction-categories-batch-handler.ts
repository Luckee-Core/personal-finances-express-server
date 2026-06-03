import type { Request, Response } from 'express';
import { processAssignTransactionCategoriesBatch } from '../process-assign-transaction-categories-batch';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/ai/transactions/assign-categories.
 */
export const postAssignTransactionCategoriesBatchHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const body = req.body ?? {};
  const rawLimit = body.limit;
  const limit =
    typeof rawLimit === 'number' && rawLimit > 0
      ? rawLimit
      : typeof rawLimit === 'string' && Number(rawLimit) > 0
        ? Number(rawLimit)
        : undefined;

  try {
    const systemPromptOverride =
      typeof body.system_prompt_override === 'string' && body.system_prompt_override.trim()
        ? body.system_prompt_override.trim()
        : undefined;

    const transactionIds = Array.isArray(body.transaction_ids)
      ? (body.transaction_ids as string[])
      : undefined;
    const categoryIds = Array.isArray(body.category_ids)
      ? (body.category_ids as string[]).filter((id) => typeof id === 'string' && id.length > 0)
      : undefined;
    const force = Boolean(body.force);
    const routeLabel =
      force && transactionIds?.length === 1 ? 'recategorize (batch×1)' : 'assign-categories';

    console.log(`📥 POST /api/ai/transactions/assign-categories [${routeLabel}]`, {
      transaction_ids: transactionIds,
      transaction_count: transactionIds?.length ?? 0,
      force,
      only_uncategorized: Boolean(body.only_uncategorized),
      category_ids: categoryIds,
      category_ids_count: categoryIds?.length ?? 0,
      has_system_prompt_override: Boolean(systemPromptOverride),
      override_chars: systemPromptOverride?.length ?? 0,
      limit,
    });

    const result = await processAssignTransactionCategoriesBatch(supabase, {
      transaction_ids: transactionIds,
      only_uncategorized: Boolean(body.only_uncategorized),
      category_ids: categoryIds,
      force,
      limit,
      system_prompt_override: systemPromptOverride,
    });
    console.log(`📤 POST /api/ai/transactions/assign-categories [${routeLabel}]`, {
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      skipped: result.skipped,
      remaining: result.remaining,
      results: result.results.map((r) => ({
        transaction_id: r.transaction.id,
        category_name: r.category_name,
        skipped: r.skipped,
        reason: r.reason,
      })),
      errors: result.errors,
    });
    sendSuccess(res, result);
  } catch (error) {
    console.error('📤 POST /api/ai/transactions/assign-categories error', error);
    sendHandlerError(res, error, 'POST /api/ai/transactions/assign-categories');
  }
};
