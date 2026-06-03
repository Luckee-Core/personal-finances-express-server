import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiPromptRow } from './types';

/**
 * Fetches one AI prompt row by id.
 */
export const getAiPromptById = async (
  supabase: SupabaseClient,
  id: string,
): Promise<AiPromptRow | null> => {
  const { data, error } = await supabase.from('ai_prompts').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch AI prompt: ${error.message}`);
  }

  return data as AiPromptRow | null;
};
