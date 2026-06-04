import type { Request, Response } from 'express';
import { updateLoanVendor } from '../update';
import type { UpdateLoanVendorInput } from '../types';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles PATCH /api/data/loan-vendors/:id.
 */
export const patchLoanVendorHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 PATCH /api/data/loan-vendors/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateLoanVendor(supabase, id, req.body as UpdateLoanVendorInput);
    console.log('📤 PATCH /api/data/loan-vendors/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/loan-vendors/:id');
  }
};
