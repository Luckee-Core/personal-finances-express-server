import type { Request, Response } from 'express';
import { updateLoan } from '../update';
import type { UpdateLoanInput } from '../types';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles PATCH /api/data/loans/:id.
 */
export const patchLoanHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/loans/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateLoan(supabase, id, req.body as UpdateLoanInput);
    console.log('📤 PATCH /api/data/loans/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/loans/:id');
  }
};
