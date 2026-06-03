import type { Request, Response } from 'express';
import { createBankAccount } from '../create';
import type { CreateBankAccountInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/bank-accounts.
 */
export const postBankAccountHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/bank-accounts');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createBankAccount(supabase, req.body as CreateBankAccountInput);
    console.log('📤 POST /api/data/bank-accounts');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/bank-accounts');
  }
};
