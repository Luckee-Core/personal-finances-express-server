import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deactivates all active prompts for a type.
 */
export const deactivateAiPromptsForType = async (
  supabase: SupabaseClient,
  type: string,
): Promise<void> => {
  const { error } = await supabase
    .from('ai_prompts')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('type', type)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to deactivate AI prompts: ${error.message}`);
  }
};
