-- Recurring detect: three-table audit (tokens on exchanges).

CREATE TABLE IF NOT EXISTS public.recurring_detect_ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  ai_prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
  prompt_type TEXT NOT NULL DEFAULT 'recurring_detect',
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

CREATE TABLE IF NOT EXISTS public.recurring_detect_ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.recurring_detect_ai_requests(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  raw_response TEXT,
  parsed_response_json JSONB,
  error_message TEXT,
  usage_input_tokens INTEGER,
  usage_output_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recurring_detect_ai_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  request_id UUID NOT NULL REFERENCES public.recurring_detect_ai_requests(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.recurring_detect_ai_responses(id) ON DELETE SET NULL,
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

ALTER TABLE public.recurring_detect_ai_requests
  DROP CONSTRAINT IF EXISTS fk_rdair_exchange;
ALTER TABLE public.recurring_detect_ai_requests
  ADD CONSTRAINT fk_rdair_exchange
  FOREIGN KEY (exchange_id) REFERENCES public.recurring_detect_ai_exchanges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rdae_slug_created
  ON public.recurring_detect_ai_exchanges (slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rdair_slug
  ON public.recurring_detect_ai_requests (slug);
