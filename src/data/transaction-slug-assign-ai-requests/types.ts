export type TransactionSlugAssignAiRequestStatus = 'pending' | 'completed' | 'failed';

export type TransactionSlugAssignAiRequest = {
  id: string;
  transaction_id: string;
  ai_prompt_id: string | null;
  prompt_type: string;
  provider: string;
  model: string;
  request_payload_json: Record<string, unknown>;
  system_prompt: string;
  user_message: string;
  status: TransactionSlugAssignAiRequestStatus;
  exchange_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionSlugAssignAiRequestInput = {
  transaction_id: string;
  ai_prompt_id?: string | null;
  prompt_type: string;
  provider: string;
  model: string;
  request_payload_json: Record<string, unknown>;
  system_prompt: string;
  user_message: string;
};

export type UpdateTransactionSlugAssignAiRequestInput = {
  status?: TransactionSlugAssignAiRequestStatus;
  exchange_id?: string | null;
};
