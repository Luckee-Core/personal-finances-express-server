export type TransactionCategoryAssignAiResponseStatus = 'success' | 'error';

export type TransactionCategoryAssignAiResponse = {
  id: string;
  request_id: string;
  model: string;
  status: TransactionCategoryAssignAiResponseStatus;
  raw_response: string | null;
  parsed_response_json: Record<string, unknown> | null;
  error_message: string | null;
  usage_input_tokens: number | null;
  usage_output_tokens: number | null;
  created_at: string;
};

export type CreateTransactionCategoryAssignAiResponseInput = {
  request_id: string;
  model: string;
  status: TransactionCategoryAssignAiResponseStatus;
  raw_response?: string | null;
  parsed_response_json?: Record<string, unknown> | null;
  error_message?: string | null;
  usage_input_tokens?: number | null;
  usage_output_tokens?: number | null;
};
