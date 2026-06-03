import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiPromptRow } from './types';

export type InsertAiPromptInput = {
  type: string;
  name: string;
  version: number;
  isActive: boolean;
  content: Record<string, unknown>;
};

/**
 * Inserts a new AI prompt version row.
 */
export const insertAiPrompt = async (
  supabase: SupabaseClient,
  input: InsertAiPromptInput,
): Promise<AiPromptRow> => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .insert({
      type: input.type,
      name: input.name,
      version: input.version,
      is_active: input.isActive,
      content: input.content,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create AI prompt: ${error.message}`);
  }

  return data as AiPromptRow;
};
