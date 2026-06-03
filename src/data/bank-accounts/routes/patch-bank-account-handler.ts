import type { Request, Response } from 'express';
import { updateBankAccount } from '../update';
import type { UpdateBankAccountInput } from '../types';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles PATCH /api/data/bank-accounts/:id.
 */
export const patchBankAccountHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/bank-accounts/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateBankAccount(supabase, id, req.body as UpdateBankAccountInput);
    console.log('📤 PATCH /api/data/bank-accounts/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/bank-accounts/:id');
  }
};
