export const AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN = 'transaction_slug_assign';
export const AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN = 'transaction_category_assign';
export const AI_PROMPT_TYPE_RECURRING_DETECT = 'recurring_detect';

export const AI_PROMPT_TYPES = [
  AI_PROMPT_TYPE_TRANSACTION_SLUG_ASSIGN,
  AI_PROMPT_TYPE_TRANSACTION_CATEGORY_ASSIGN,
  AI_PROMPT_TYPE_RECURRING_DETECT,
] as const;

export type AiPromptType = (typeof AI_PROMPT_TYPES)[number];
