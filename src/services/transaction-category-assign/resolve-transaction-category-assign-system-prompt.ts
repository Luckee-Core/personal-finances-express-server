import type { SupabaseClient } from '@supabase/supabase-js';
import { AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN } from '../../constants/ai-prompt-types';
import { getActiveAiPromptByType } from '../../data/ai-prompts';
import type { CustomerStudioAiPromptContent } from '../../data/ai-prompts/types';
import { DEFAULT_TRANSACTION_CATEGORY_ASSIGN_SYSTEM_PROMPT } from './default-transaction-category-assign-system-prompt';

export type ResolvedCategoryAssignPrompt = {
  systemPrompt: string;
  aiPromptId: string | null;
};

/**
 * Resolves the active DB prompt or built-in fallback for transaction category assign.
 */
export const resolveTransactionCategoryAssignSystemPrompt = async (
  supabase: SupabaseClient,
): Promise<ResolvedCategoryAssignPrompt> => {
  const active = await getActiveAiPromptByType(
    supabase,
    AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN,
  );
  if (active?.content && typeof active.content === 'object') {
    const content = active.content as CustomerStudioAiPromptContent;
    if (typeof content.systemPrompt === 'string' && content.systemPrompt.trim()) {
      return { systemPrompt: content.systemPrompt.trim(), aiPromptId: active.id };
    }
  }
  return {
    systemPrompt: DEFAULT_TRANSACTION_CATEGORY_ASSIGN_SYSTEM_PROMPT,
    aiPromptId: active?.id ?? null,
  };
};
