import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreditCard, UpdateCreditCardInput } from './types';

export const updateCreditCard = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateCreditCardInput,
): Promise<CreditCard> => {
  const patch: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }
  if (input.issuer !== undefined) {
    patch.issuer = input.issuer?.trim() || null;
  }
  if (input.last_four !== undefined) {
    const lastFour = input.last_four?.trim() || null;
    if (lastFour && !/^\d{4}$/.test(lastFour)) {
      throw new Error('last_four must be 4 digits');
    }
    patch.last_four = lastFour;
  }

  const { data, error } = await supabase
    .from('credit_cards')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update credit card: ${error.message}`);
  }

  return data as CreditCard;
};
