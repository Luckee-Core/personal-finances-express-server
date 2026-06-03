import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateCreditCardInput, CreditCard } from './types';

export const createCreditCard = async (
  supabase: SupabaseClient,
  input: CreateCreditCardInput,
): Promise<CreditCard> => {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }

  const lastFour = input.last_four?.trim() || null;
  if (lastFour && !/^\d{4}$/.test(lastFour)) {
    throw new Error('last_four must be 4 digits');
  }

  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      name,
      issuer: input.issuer?.trim() || null,
      last_four: lastFour,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create credit card: ${error.message}`);
  }

  return data as CreditCard;
};
