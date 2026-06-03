import type { Request, Response } from 'express';
import { deleteCategory } from '../delete';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles DELETE /api/data/categories/:id.
 */
export const deleteCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 DELETE /api/data/categories/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteCategory(supabase, id);
    console.log('📤 DELETE /api/data/categories/:id');
    sendSuccess(res, null);
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/categories/:id');
  }
};
