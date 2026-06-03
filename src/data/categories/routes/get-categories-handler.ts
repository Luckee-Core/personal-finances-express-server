import type { Request, Response } from 'express';
import { getAllCategories } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/categories.
 */
export const getCategoriesHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/categories');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllCategories(supabase);
    console.log('📤 GET /api/data/categories');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/categories');
  }
};
