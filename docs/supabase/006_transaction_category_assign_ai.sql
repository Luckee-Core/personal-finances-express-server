-- Transaction category assignment: audit tables, last exchange FK, seed AI prompt.

CREATE TABLE IF NOT EXISTS public.transaction_category_assign_ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  ai_prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
  prompt_type TEXT NOT NULL DEFAULT 'transaction_category_assign',
  provider TEXT NOT NULL DEFAULT 'anthropic',
  model TEXT NOT NULL,
  request_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  system_prompt TEXT NOT NULL DEFAULT '',
  user_message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  exchange_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transaction_category_assign_ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.transaction_category_assign_ai_requests(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  raw_response TEXT,
  parsed_response_json JSONB,
  error_message TEXT,
  usage_input_tokens INTEGER,
  usage_output_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transaction_category_assign_ai_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.transaction_category_assign_ai_requests(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.transaction_category_assign_ai_responses(id) ON DELETE SET NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  model_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_category_assign_ai_requests
  DROP CONSTRAINT IF EXISTS fk_tcar_exchange;
ALTER TABLE public.transaction_category_assign_ai_requests
  ADD CONSTRAINT fk_tcar_exchange
  FOREIGN KEY (exchange_id) REFERENCES public.transaction_category_assign_ai_exchanges(id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS last_category_assign_exchange_id UUID;

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS fk_transactions_last_category_exchange;
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_last_category_exchange
  FOREIGN KEY (last_category_assign_exchange_id)
  REFERENCES public.transaction_category_assign_ai_exchanges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tcae_transaction_created
  ON public.transaction_category_assign_ai_exchanges (transaction_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tcar_transaction_id
  ON public.transaction_category_assign_ai_requests (transaction_id);

CREATE INDEX IF NOT EXISTS idx_tcar_exchange_id
  ON public.transaction_category_assign_ai_requests (exchange_id);

INSERT INTO public.ai_prompts (type, name, version, is_active, content)
SELECT
  'transaction_category_assign',
  'Default category assign v1',
  1,
  true,
  jsonb_build_object(
    'systemPrompt',
    'You assign personal finance categories to bank transactions. Respond with JSON only, no markdown.

Rules:
- Prefer an existing category from existing_categories when it clearly fits (set matched_existing true and category_id to that id).
- If no existing category fits well, set matched_existing false and provide a concise new category_name to create (Title Case, 2-40 chars).
- Use transaction description, amount, slug (merchant), and posted_on for context.
- category_id must be null when matched_existing is false; must be a valid id from existing_categories when matched_existing is true.
- confidence: one of high, medium, low.
- reason: one short sentence.

Output shape: {"category_id":"uuid-or-null","category_name":"...","matched_existing":true|false,"confidence":"high|medium|low","reason":"..."}'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE type = 'transaction_category_assign' AND is_active = true
);
