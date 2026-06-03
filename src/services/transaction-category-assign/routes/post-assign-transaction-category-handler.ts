import type { Request, Response } from 'express';
import { processAssignTransactionCategory } from '../process-assign-transaction-category';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/ai/transactions/:id/assign-category.
 */
export const postAssignTransactionCategoryHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid transaction id');
    return;
  }

  const force =
    req.query.force === 'true' ||
    req.query.force === '1' ||
    Boolean((req.body ?? {}).force);

  const body = req.body ?? {};
  const systemPromptOverride =
    typeof body.system_prompt_override === 'string' && body.system_prompt_override.trim()
      ? body.system_prompt_override.trim()
      : undefined;

  const routeLabel = force ? 'recategorize (single)' : 'assign-category';
  console.log(`📥 POST /api/ai/transactions/:id/assign-category [${routeLabel}]`, {
    transaction_id: id,
    force,
    has_system_prompt_override: Boolean(systemPromptOverride),
    override_chars: systemPromptOverride?.length ?? 0,
    body_keys: Object.keys(body),
  });

  try {
    const result = await processAssignTransactionCategory(supabase, id, {
      force,
      systemPromptOverride,
    });
    console.log(`📤 POST /api/ai/transactions/:id/assign-category [${routeLabel}]`, {
      transaction_id: id,
      category_name: result.category_name,
      category_id: result.category_id,
      skipped: result.skipped,
      reason: result.reason,
    });
    sendSuccess(res, result);
  } catch (error) {
    console.error(`📤 POST /api/ai/transactions/:id/assign-category [${routeLabel}] error`, {
      transaction_id: id,
      error,
    });
    sendHandlerError(res, error, 'POST /api/ai/transactions/:id/assign-category');
  }
};
