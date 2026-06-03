import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringPurchase } from './types';

export const getRecurringPurchaseById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<RecurringPurchase | null> => {
  const { data, error } = await supabase
    .from('recurring_purchases')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch recurring purchase: ${error.message}`);
  }

  return data as RecurringPurchase | null;
};
