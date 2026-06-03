export type RecurringDetectAiRequestStatus = 'pending' | 'completed' | 'failed';

export type RecurringDetectAiRequest = {
  id: string;
  slug: string;
  ai_prompt_id: string | null;
  prompt_type: string;
  provider: string;
  model: string;
  request_payload_json: Record<string, unknown>;
  system_prompt: string;
  user_message: string;
  status: RecurringDetectAiRequestStatus;
  exchange_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateRecurringDetectAiRequestInput = {
  slug: string;
  ai_prompt_id?: string | null;
  prompt_type: string;
  provider: string;
  model: string;
  request_payload_json: Record<string, unknown>;
  system_prompt: string;
  user_message: string;
};

export type UpdateRecurringDetectAiRequestInput = {
  status?: RecurringDetectAiRequestStatus;
  exchange_id?: string | null;
};
