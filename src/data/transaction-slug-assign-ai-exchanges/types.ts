export type TransactionSlugAssignAiExchangeStatus = 'pending' | 'completed' | 'failed';

export type TransactionSlugAssignAiExchange = {
  id: string;
  transaction_id: string;
  request_id: string;
  response_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  model_used: string | null;
  status: TransactionSlugAssignAiExchangeStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionSlugAssignAiExchangeInput = {
  transaction_id: string;
  request_id: string;
  model_used: string;
};

export type UpdateTransactionSlugAssignAiExchangeInput = {
  response_id?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  status?: TransactionSlugAssignAiExchangeStatus;
  error_message?: string | null;
};
