import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiPromptRow } from './types';

export type UpdateAiPromptInput = {
  id: string;
  name?: string;
  content?: Record<string, unknown>;
};

/**
 * Updates name and/or content for a prompt row.
 */
export const updateAiPrompt = async (
  supabase: SupabaseClient,
  input: UpdateAiPromptInput,
): Promise<AiPromptRow> => {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) patch.name = input.name;
  if (input.content !== undefined) patch.content = input.content;

  const { data, error } = await supabase
    .from('ai_prompts')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update AI prompt: ${error.message}`);
  }

  return data as AiPromptRow;
};
