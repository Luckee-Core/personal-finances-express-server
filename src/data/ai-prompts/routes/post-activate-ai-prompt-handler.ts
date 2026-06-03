import type { Request, Response } from 'express';
import { setAiPromptActive } from '../set-ai-prompt-active';
import { toAiPromptDto } from '../../../utils/ai-prompts/to-ai-prompt-dto';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/ai-prompts/:id/activate.
 */
export const postActivateAiPromptHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/ai-prompts/:id/activate');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const row = await setAiPromptActive(supabase, id);
    console.log('📤 POST /api/data/ai-prompts/:id/activate');
    sendSuccess(res, toAiPromptDto(row));
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/ai-prompts/:id/activate');
  }
};
