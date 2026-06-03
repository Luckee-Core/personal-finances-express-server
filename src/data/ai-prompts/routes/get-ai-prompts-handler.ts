import type { Request, Response } from 'express';
import { listAiPrompts } from '../list-ai-prompts';
import { toAiPromptDto } from '../../../utils/ai-prompts/to-ai-prompt-dto';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/ai-prompts.
 */
export const getAiPromptsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/ai-prompts');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
    const rows = await listAiPrompts(supabase, { type: type || undefined });
    console.log('📤 GET /api/data/ai-prompts');
    sendSuccess(res, rows.map(toAiPromptDto));
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/ai-prompts');
  }
};
