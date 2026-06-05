import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreditCard } from './types';

/**
 * Lists all credit cards.
 */
export const getAllCreditCards = async (supabase: SupabaseClient): Promise<CreditCard[]> => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to load credit cards: ${error.message}`);
  }

  return (data ?? []) as CreditCard[];
};
