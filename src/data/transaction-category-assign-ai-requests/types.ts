export type TransactionCategoryAssignAiRequestStatus = 'pending' | 'completed' | 'failed';

export type TransactionCategoryAssignAiRequest = {
  id: string;
  transaction_id: string;
  ai_prompt_id: string | null;
  prompt_type: string;
  provider: string;
  model: string;
  request_payload_json: Record<string, unknown>;
  system_prompt: string;
  user_message: string;
  status: TransactionCategoryAssignAiRequestStatus;
  exchange_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionCategoryAssignAiRequestInput = {
  transaction_id: string;
  ai_prompt_id?: string | null;
  prompt_type: string;
  provider: string;
  model: string;
  request_payload_json: Record<string, unknown>;
  system_prompt: string;
  user_message: string;
};

export type UpdateTransactionCategoryAssignAiRequestInput = {
  status?: TransactionCategoryAssignAiRequestStatus;
  exchange_id?: string | null;
};
