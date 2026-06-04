import type { Request, Response } from 'express';
import { createLoanVendor } from '../create';
import type { CreateLoanVendorInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/loan-vendors.
 */
export const postLoanVendorHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/loan-vendors');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createLoanVendor(supabase, req.body as CreateLoanVendorInput);
    console.log('📤 POST /api/data/loan-vendors');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/loan-vendors');
  }
};
