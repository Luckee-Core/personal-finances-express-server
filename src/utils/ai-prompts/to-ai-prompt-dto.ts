import type { AiPromptRow } from '../../data/ai-prompts/types';

export type AiPromptDto = {
  id: string;
  type: string;
  name: string;
  version: number;
  isActive: boolean;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

/**
 * Maps a database ai_prompt row to the API DTO shape.
 */
export const toAiPromptDto = (row: AiPromptRow): AiPromptDto => ({
  id: row.id,
  type: row.type,
  name: row.name,
  version: row.version,
  isActive: row.is_active,
  content: row.content ?? {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
