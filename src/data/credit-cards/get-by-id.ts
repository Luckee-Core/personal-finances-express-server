import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreditCard } from './types';

export const getCreditCardById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<CreditCard | null> => {
  const { data, error } = await supabase.from('credit_cards').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load credit card: ${error.message}`);
  }

  return (data as CreditCard | null) ?? null;
};
