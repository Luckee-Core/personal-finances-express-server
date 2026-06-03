-- LLM model pricing catalog (single Haiku model for personal-finances AI flows).

CREATE TABLE IF NOT EXISTS public.llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL UNIQUE,
  input_cost_per_million_usd NUMERIC(12, 6) NOT NULL,
  output_cost_per_million_usd NUMERIC(12, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.llm_models (provider, model, input_cost_per_million_usd, output_cost_per_million_usd)
VALUES ('anthropic', 'claude-haiku-4-5-20251001', 1.000000, 5.000000)
ON CONFLICT (model) DO UPDATE
SET
  provider = EXCLUDED.provider,
  input_cost_per_million_usd = EXCLUDED.input_cost_per_million_usd,
  output_cost_per_million_usd = EXCLUDED.output_cost_per_million_usd,
  updated_at = now();
