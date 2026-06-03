import type { Request, Response } from 'express';
import { getAllLlmModels } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/llm-models.
 */
export const getLlmModelsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/llm-models');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllLlmModels(supabase);
    console.log('📤 GET /api/data/llm-models');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/llm-models');
  }
};
