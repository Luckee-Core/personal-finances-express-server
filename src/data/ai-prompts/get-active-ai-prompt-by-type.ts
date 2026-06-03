import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiPromptRow } from './types';

/**
 * Returns the active prompt for a type (at most one per type).
 */
export const getActiveAiPromptByType = async (
  supabase: SupabaseClient,
  type: string,
): Promise<AiPromptRow | null> => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active AI prompt: ${error.message}`);
  }

  return data as AiPromptRow | null;
};
