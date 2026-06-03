import type { Request, Response } from 'express';
import { getAiPromptById } from '../get-ai-prompt-by-id';
import { toAiPromptDto } from '../../../utils/ai-prompts/to-ai-prompt-dto';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/ai-prompts/:id.
 */
export const getAiPromptByIdHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/ai-prompts/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const row = await getAiPromptById(supabase, id);
    if (!row) {
      sendClientError(res, 'Not found');
      return;
    }
    console.log('📤 GET /api/data/ai-prompts/:id');
    sendSuccess(res, toAiPromptDto(row));
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/ai-prompts/:id');
  }
};
