import type { Request, Response } from 'express';
import { createLoan } from '../create';
import type { CreateLoanInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/loans.
 */
export const postLoanHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/loans');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createLoan(supabase, req.body as CreateLoanInput);
    console.log('📤 POST /api/data/loans');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/loans');
  }
};
