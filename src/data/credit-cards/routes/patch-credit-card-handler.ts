import type { Request, Response } from 'express';
import { updateCreditCard } from '../update';
import type { UpdateCreditCardInput } from '../types';
import { parseRouteId, requireSupabase, sendClientError, sendHandlerError, sendSuccess } from '../../../utils/http';

export const patchCreditCardHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('📥 PATCH /api/data/credit-cards/:id');
  const supabase = requireSupabase(req, res);
  if (!supabase) return;

  const id = parseRouteId(req.params.id);
  if (!id) {
    sendClientError(res, 'Invalid id');
    return;
  }

  try {
    const updated = await updateCreditCard(supabase, id, req.body as UpdateCreditCardInput);
    console.log('📤 PATCH /api/data/credit-cards/:id');
    sendSuccess(res, updated);
  } catch (error) {
    sendHandlerError(res, error, 'PATCH /api/data/credit-cards/:id');
  }
};
