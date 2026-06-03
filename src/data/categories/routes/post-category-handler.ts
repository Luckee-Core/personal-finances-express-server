import type { Request, Response } from 'express';
import { createCategory } from '../create';
import type { CreateCategoryInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/categories.
 */
export const postCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/categories');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createCategory(supabase, req.body as CreateCategoryInput);
    console.log('📤 POST /api/data/categories');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/categories');
  }
};
