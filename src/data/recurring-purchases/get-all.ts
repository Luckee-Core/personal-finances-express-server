import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringPurchase } from './types';

export const getAllRecurringPurchases = async (
  supabase: SupabaseClient,
): Promise<RecurringPurchase[]> => {
  const { data, error } = await supabase
    .from('recurring_purchases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch recurring purchases: ${error.message}`);
  }

  return (data ?? []) as RecurringPurchase[];
};
