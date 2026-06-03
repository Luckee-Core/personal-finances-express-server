import type { Request, Response } from 'express';
import { updateCategory } from '../update';
import type { UpdateCategoryInput } from '../types';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles PATCH /api/data/categories/:id.
 */
export const patchCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/categories/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateCategory(supabase, id, req.body as UpdateCategoryInput);
    console.log('📤 PATCH /api/data/categories/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/categories/:id');
  }
};
