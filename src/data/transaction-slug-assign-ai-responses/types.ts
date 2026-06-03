export type TransactionSlugAssignAiResponseStatus = 'success' | 'error';

export type TransactionSlugAssignAiResponse = {
  id: string;
  request_id: string;
  model: string;
  status: TransactionSlugAssignAiResponseStatus;
  raw_response: string | null;
  parsed_response_json: Record<string, unknown> | null;
  error_message: string | null;
  usage_input_tokens: number | null;
  usage_output_tokens: number | null;
  created_at: string;
};

export type CreateTransactionSlugAssignAiResponseInput = {
  request_id: string;
  model: string;
  status: TransactionSlugAssignAiResponseStatus;
  raw_response?: string | null;
  parsed_response_json?: Record<string, unknown> | null;
  error_message?: string | null;
  usage_input_tokens?: number | null;
  usage_output_tokens?: number | null;
};
