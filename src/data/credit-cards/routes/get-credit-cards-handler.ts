import type { Request, Response } from 'express';
import { getAllCreditCards } from '../get-all';
import { requireSupabase, sendHandlerError, sendSuccess } from '../../../utils/http';

export const getCreditCardsHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api/data/credit-cards');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  try {
    const rows = await getAllCreditCards(supabase);
    console.log('📤 GET /api/data/credit-cards');
    sendSuccess(res, rows);
  } catch (error) {
    sendHandlerError(res, error, 'GET /api/data/credit-cards');
  }
};
