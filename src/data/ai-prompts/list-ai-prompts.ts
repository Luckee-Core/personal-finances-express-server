import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiPromptRow } from './types';

type ListAiPromptsInput = {
  type?: string;
};

/**
 * Lists AI prompt rows, optionally filtered by type.
 */
export const listAiPrompts = async (
  supabase: SupabaseClient,
  input: ListAiPromptsInput,
): Promise<AiPromptRow[]> => {
  let q = supabase.from('ai_prompts').select('*').order('updated_at', { ascending: false });

  if (input.type?.trim()) {
    q = q.eq('type', input.type.trim());
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list AI prompts: ${error.message}`);
  }

  return (data ?? []) as AiPromptRow[];
};
