import type { Request, Response } from 'express';
import { getStatementImportById } from '../get-by-id';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/statement-imports/:id.
 */
export const getStatementImportByIdHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/statement-imports/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const row = await getStatementImportById(supabase, id);
    if (!row) {
      sendClientError(res, 'Statement import not found');
      return;
    }
    console.log('📤 GET /api/data/statement-imports/:id');
    sendSuccess(res, row);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/statement-imports/:id');
  }
};
