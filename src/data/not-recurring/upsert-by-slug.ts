import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateNotRecurringInput, NotRecurring } from './types';

export const upsertNotRecurringBySlug = async (
  supabase: SupabaseClient,
  input: CreateNotRecurringInput,
): Promise<NotRecurring> => {
  const slug = input.slug?.trim().toLowerCase();
  if (!slug) {
    throw new Error('slug is required');
  }

  const { data, error } = await supabase
    .from('not_recurring')
    .upsert(
      {
        slug,
        notes: input.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert not_recurring: ${error.message}`);
  }

  return data as NotRecurring;
};
