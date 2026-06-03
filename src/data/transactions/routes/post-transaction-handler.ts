import type { Request, Response } from 'express';
import { createTransaction } from '../create';
import type { CreateTransactionInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

/**
 * Handles POST /api/data/transactions.
 */
export const postTransactionHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/transactions');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createTransaction(supabase, req.body as CreateTransactionInput);
    console.log('📤 POST /api/data/transactions');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/transactions');
  }
};
