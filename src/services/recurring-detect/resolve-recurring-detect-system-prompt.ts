import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_RECURRING_DETECT } from '../../constants/ai-prompt-types';
import { getActiveAiPromptByType } from '../../data/ai-prompts';
import type { CustomerStudioAiPromptContent } from '../../data/ai-prompts/types';
import { DEFAULT_RECURRING_DETECT_SYSTEM_PROMPT } from './default-recurring-detect-system-prompt';

export type ResolvedRecurringDetectPrompt = {
  systemPrompt: string;
  aiPromptId: string | null;
};

/**
 * Resolves the active DB prompt or built-in fallback for recurring detection.
 */
export const resolveRecurringDetectSystemPrompt = async (
  supabase: SupabaseClient,
): Promise<ResolvedRecurringDetectPrompt> => {
  const active = await getActiveAiPromptByType(supabase, AI_PROMPT_TYPE_RECURRING_DETECT);
  if (active?.content && typeof active.content === 'object') {
    const content = active.content as CustomerStudioAiPromptContent;
    if (typeof content.systemPrompt === 'string' && content.systemPrompt.trim()) {
      return { systemPrompt: content.systemPrompt.trim(), aiPromptId: active.id };
    }
  }
  return {
    systemPrompt: DEFAULT_RECURRING_DETECT_SYSTEM_PROMPT,
    aiPromptId: active?.id ?? null,
  };
};
