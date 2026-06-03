import {
  AI_PROMPT_TYPE_RECURRING_DETECT,
  AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN,
  AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN,
} from '../../constants/ai-prompt-types';

export type ModelConfig = {
  model: string;
  temperature: number;
  maxTokens: number;
};

export const DEFAULT_LLM_MODEL = 'claude-haiku-4-5-20251001';

const BASE = { model: DEFAULT_LLM_MODEL, temperature: 0 as const };

const CONFIGS: Record<string, ModelConfig> = {
  [AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN]: { ...BASE, maxTokens: 256 },
  [AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN]: { ...BASE, maxTokens: 384 },
  [AI_PROMPT_TYPE_RECURRING_DETECT]: { ...BASE, maxTokens: 16384 },
};

/**
 * Returns model settings for a prompt type key.
 */
export const getModelConfig = (messageType: string): ModelConfig => {
  const config = CONFIGS[messageType];
  if (!config) {
    throw new Error(`Unknown message type: ${messageType}`);
  }
  return config;
};
