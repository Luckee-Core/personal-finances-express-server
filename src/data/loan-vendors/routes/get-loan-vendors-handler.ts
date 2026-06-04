import type { Request, Response } from 'express';
import { getAllLoanVendors } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles GET /api/data/loan-vendors.
 */
export const getLoanVendorsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/loan-vendors');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllLoanVendors(supabase);
    console.log('📤 GET /api/data/loan-vendors');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/loan-vendors');
  }
};
