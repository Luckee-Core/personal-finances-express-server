import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns the next version number for a prompt type.
 */
export const getNextAiPromptVersion = async (
  supabase: SupabaseClient,
  type: string,
): Promise<number> => {
  const { data, error } = await supabase
    .from('ai_prompts')
    .select('version')
    .eq('type', type)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve AI prompt version: ${error.message}`);
  }

  const v =
    data && typeof (data as { version?: unknown }).version === 'number'
      ? (data as { version: number }).version
      : 0;
  return v + 1;
};
