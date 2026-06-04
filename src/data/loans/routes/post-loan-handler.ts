import type { Request, Response } from 'express';
import { createLoan } from '../create';
import type { CreateLoanInput } from '../types';
import {
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles POST /api/data/loans.
 */
export const postLoanHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/loans');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const body = req.body as CreateLoanInput;
  if (!body?.name?.trim()) {
    sendClientError(res, 'name is required');
    return;
  }

  try {
    const created = await createLoan(supabase, body);
    console.log('📤 POST /api/data/loans');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/loans');
  }
};
