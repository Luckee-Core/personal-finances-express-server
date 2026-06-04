import type { Request, Response } from 'express';
import { deleteLoanVendor } from '../delete';
import {
  parseRouteId,
  requireSupabase,
  sendClientError,
  sendHandlerError,
  sendSuccess,
} from '../../../utils/http';

/**
 * Handles DELETE /api/data/loan-vendors/:id.
 */
export const deleteLoanVendorHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('📥 DELETE /api/data/loan-vendors/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    await deleteLoanVendor(supabase, id);
    console.log('📤 DELETE /api/data/loan-vendors/:id');
    sendSuccess(res, { id });
  } catch (error) {
    sendHandlerError(res, error, 'DELETE /api/data/loan-vendors/:id');
  }
};
