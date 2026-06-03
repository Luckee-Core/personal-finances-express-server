import type { Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getManagedSupabaseClient } from '../../services/supabase';
import { sendServerError } from './responses';

/**
 * Returns the managed Supabase client for this request.
 */
export const requireSupabase = (req: Request, res: Response): SupabaseClient | null => {
  const supabase = req.supabase ?? getManagedSupabaseClient();
  if (!supabase) {
    console.error('❌ Supabase client unavailable');
    sendServerError(res, 'Service unavailable');
    return null;
  }
  return supabase;
};
