import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiPromptRow } from './types';
import { deactivateAiPromptsForType } from './deactivate-ai-prompts-for-type';

/**
 * Activates one prompt and deactivates other rows for the same type.
 */
export const setAiPromptActive = async (
  supabase: SupabaseClient,
  id: string,
): Promise<AiPromptRow> => {
  const { data: row, error: fetchErr } = await supabase
    .from('ai_prompts')
    .select('type')
    .eq('id', id)
    .single();

  if (fetchErr || !row || typeof (row as { type?: unknown }).type !== 'string') {
    throw new Error(fetchErr?.message ?? 'AI prompt not found');
  }

  const type = (row as { type: string }).type;
  await deactivateAiPromptsForType(supabase, type);

  const { data, error } = await supabase
    .from('ai_prompts')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to activate AI prompt: ${error.message}`);
  }

  return data as AiPromptRow;
};
