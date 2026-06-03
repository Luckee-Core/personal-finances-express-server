import type { SupabaseClient } from '@supabase/supabase-js';
import type { LlmModel } from './types';

/**
 * Retrieves all LLM model pricing rows.
 */
export const getAllLlmModels = async (supabase: SupabaseClient): Promise<LlmModel[]> => {
  const { data, error } = await supabase
    .from('llm_models')
    .select('*')
    .order('model', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch llm models: ${error.message}`);
  }

  return (data ?? []) as LlmModel[];
};
