import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes an AI prompt row by id.
 */
export const deleteAiPromptById = async (supabase: SupabaseClient, id: string): Promise<void> => {
  const { error } = await supabase.from('ai_prompts').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete AI prompt: ${error.message}`);
  }
};
