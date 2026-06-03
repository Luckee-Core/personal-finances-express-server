import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN } from '../../constants/ai-prompt-types';
import { getActiveAiPromptByType } from '../../data/ai-prompts';
import type { CustomerStudioAiPromptContent } from '../../data/ai-prompts/types';
import { DEFAULT_TRANSACTION_SLUG_ASSIGN_SYSTEM_PROMPT } from './default-transaction-slug-assign-system-prompt';

export type ResolvedSlugAssignPrompt = {
  systemPrompt: string;
  aiPromptId: string | null;
};

/**
 * Resolves the active DB prompt or built-in fallback for transaction slug assign.
 */
export const resolveTransactionSlugAssignSystemPrompt = async (
  supabase: SupabaseClient,
): Promise<ResolvedSlugAssignPrompt> => {
  const active = await getActiveAiPromptByType(supabase, AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN);
  if (active?.content && typeof active.content === 'object') {
    const content = active.content as CustomerStudioAiPromptContent;
    if (typeof content.systemPrompt === 'string' && content.systemPrompt.trim()) {
      return { systemPrompt: content.systemPrompt.trim(), aiPromptId: active.id };
    }
  }
  return {
    systemPrompt: DEFAULT_TRANSACTION_SLUG_ASSIGN_SYSTEM_PROMPT,
    aiPromptId: active?.id ?? null,
  };
};
