export type TransactionCategoryAssignAiExchangeStatus = 'pending' | 'completed' | 'failed';

export type TransactionCategoryAssignAiExchange = {
  id: string;
  transaction_id: string;
  request_id: string;
  response_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  model_used: string | null;
  status: TransactionCategoryAssignAiExchangeStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTransactionCategoryAssignAiExchangeInput = {
  transaction_id: string;
  request_id: string;
  model_used: string;
};

export type UpdateTransactionCategoryAssignAiExchangeInput = {
  response_id?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  status?: TransactionCategoryAssignAiExchangeStatus;
  error_message?: string | null;
};
