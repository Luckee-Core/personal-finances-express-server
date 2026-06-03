import type { Request, Response } from 'express';
import { createCreditCard } from '../create';
import type { CreateCreditCardInput } from '../types';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

export const postCreditCardHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 POST /api/data/credit-cards');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const created = await createCreditCard(supabase, req.body as CreateCreditCardInput);
    console.log('📤 POST /api/data/credit-cards');
    sendSuccess(res, created);
  } catch (error) {
    sendHandlerError(res, error, 'POST /api/data/credit-cards');
  }
};
