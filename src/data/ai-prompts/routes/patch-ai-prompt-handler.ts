import type { Request, Response } from 'express';
import { updateAiPrompt } from '../update-ai-prompt';
import { toAiPromptDto } from '../../../utils/ai-prompts/to-ai-prompt-dto';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles PATCH /api/data/ai-prompts/:id.
 */
export const patchAiPromptHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/ai-prompts/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  const body = req.body ?? {};
  const patch: { name?: string; content?: Record<string, unknown> } = {};
  if (typeof body.name === 'string') patch.name = body.name.trim();
  if (body.content && typeof body.content === 'object' && !Array.isArray(body.content)) {
    patch.content = body.content as Record<string, unknown>;
  }
  if (patch.name === undefined && patch.content === undefined) {
    sendClientError(res, 'No updates');
    return;
  }

  try {
    const row = await updateAiPrompt(supabase, { id, ...patch });
    console.log('📤 PATCH /api/data/ai-prompts/:id');
    sendSuccess(res, toAiPromptDto(row));
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/ai-prompts/:id');
  }
};
