import type { Request, Response } from 'express';
import { deactivateAiPromptsForType } from '../deactivate-ai-prompts-for-type';
import { getNextAiPromptVersion } from '../get-next-ai-prompt-version';
import { insertAiPrompt } from '../insert-ai-prompt';
import { toAiPromptDto } from '../../../utils/ai-prompts/to-ai-prompt-dto';
import { requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/ai-prompts.
 */
export const postAiPromptHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/ai-prompts');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const body = req.body ?? {};
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!type || !name) {
    sendClientError(res, 'type and name are required');
    return;
  }

  const content =
    body.content && typeof body.content === 'object' && !Array.isArray(body.content)
      ? (body.content as Record<string, unknown>)
      : {};
  const makeActive = Boolean(body.makeActive);

  try {
    const version = await getNextAiPromptVersion(supabase, type);
    if (makeActive) {
      await deactivateAiPromptsForType(supabase, type);
    }
    const row = await insertAiPrompt(supabase, {
      type,
      name,
      version,
      isActive: makeActive,
      content,
    });
    console.log('📤 POST /api/data/ai-prompts');
    sendSuccess(res, toAiPromptDto(row));
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/ai-prompts');
  }
};
