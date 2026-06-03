import type { Request, Response } from 'express';
import { getAllStatementImports } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/statement-imports.
 */
export const getStatementImportsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/statement-imports');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllStatementImports(supabase);
    console.log('📤 GET /api/data/statement-imports');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/statement-imports');
  }
};
