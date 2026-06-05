import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecurringPurchase } from './types';

/**
 * Lists all recurring purchases.
 */
export const getAllRecurringPurchases = async (
  supabase: SupabaseClient,
): Promise<RecurringPurchase[]> => {
  console.log('💾 getAllRecurringPurchases');
  const { data, error } = await supabase
    .from('recurring_purchases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch recurring purchases: ${error.message}`);
  }

  return (data ?? []) as RecurringPurchase[];
};
