import type { Request, Response } from 'express';
import { deleteAiPromptById } from '../delete-ai-prompt-by-id';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles DELETE /api/data/ai-prompts/:id.
 */
export const deleteAiPromptHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 DELETE /api/data/ai-prompts/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteAiPromptById(supabase, id);
    console.log('📤 DELETE /api/data/ai-prompts/:id');
    sendSuccess(res, null);
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/ai-prompts/:id');
  }
};
