import type { Request, Response } from 'express';
import { processAssignTransactionSlug } from '../process-assign-transaction-slug';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/ai/transactions/:id/assign-slug.
 */
export const postAssignTransactionSlugHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/ai/transactions/:id/assign-slug');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid transaction id');
    return;
  }

  const force =
    req.query.force === 'true' || req.query.force === '1' || Boolean((req.body ?? {}).force);

  const body = req.body ?? {};
  const systemPromptOverride =
    typeof body.system_prompt_override === 'string' && body.system_prompt_override.trim()
      ? body.system_prompt_override.trim()
      : undefined;

  try {
    const result = await processAssignTransactionSlug(supabase, id, {
      force,
      systemPromptOverride,
    });
    console.log('📤 POST /api/ai/transactions/:id/assign-slug');
    sendSuccess(res, result);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/ai/transactions/:id/assign-slug');
  }
};
