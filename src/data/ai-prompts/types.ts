export type AiPromptRow = {
  id: string;
  type: string;
  name: string;
  version: number;
  is_active: boolean;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CustomerStudioAiPromptContent = {
  systemPrompt: string;
};
