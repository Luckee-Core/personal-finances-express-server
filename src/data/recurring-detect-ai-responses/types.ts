export type RecurringDetectAiResponseStatus = 'success' | 'error';

export type RecurringDetectAiResponse = {
  id: string;
  request_id: string;
  model: string;
  status: RecurringDetectAiResponseStatus;
  raw_response: string | null;
  parsed_response_json: Record<string, unknown> | null;
  error_message: string | null;
  usage_input_tokens: number | null;
  usage_output_tokens: number | null;
  created_at: string;
};

export type CreateRecurringDetectAiResponseInput = {
  request_id: string;
  model: string;
  status: RecurringDetectAiResponseStatus;
  raw_response?: string | null;
  parsed_response_json?: Record<string, unknown> | null;
  error_message?: string | null;
  usage_input_tokens?: number | null;
  usage_output_tokens?: number | null;
};
