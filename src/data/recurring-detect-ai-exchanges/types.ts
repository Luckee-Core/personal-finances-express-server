export type RecurringDetectAiExchangeStatus = 'pending' | 'completed' | 'failed';

export type RecurringDetectAiExchange = {
  id: string;
  slug: string;
  request_id: string;
  response_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  model_used: string | null;
  status: RecurringDetectAiExchangeStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateRecurringDetectAiExchangeInput = {
  slug: string;
  request_id: string;
  model_used: string;
};

export type UpdateRecurringDetectAiExchangeInput = {
  response_id?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  status?: RecurringDetectAiExchangeStatus;
  error_message?: string | null;
};
