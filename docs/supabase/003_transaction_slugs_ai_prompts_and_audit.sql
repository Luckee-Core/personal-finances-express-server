-- Personal Finances — run this ONE file in Supabase SQL editor (idempotent).
-- Includes: transactions.slug, single-tenant ai_prompts (drops legacy user_id), audit tables, seed prompt.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS last_slug_assign_exchange_id UUID;

CREATE INDEX IF NOT EXISTS idx_transactions_slug
  ON public.transactions (slug)
  WHERE slug IS NOT NULL;

-- ai_prompts: single-tenant (no user_id). CREATE IF NOT EXISTS for fresh DBs; ALTER below for legacy Luckee-shaped tables.
CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT false,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Legacy schema cleanup: drop per-user scoping (safe if column already absent)
DROP INDEX IF EXISTS public.ai_prompts_one_active_per_user_type;
DROP INDEX IF EXISTS public.idx_ai_prompts_user_type_version;
DROP INDEX IF EXISTS public.idx_ai_prompts_user_updated;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY type
      ORDER BY version DESC, updated_at DESC
    ) AS rn
  FROM public.ai_prompts
  WHERE is_active IS TRUE
)
UPDATE public.ai_prompts a
SET
  is_active = false,
  updated_at = NOW()
FROM ranked r
WHERE a.id = r.id
  AND r.rn > 1;

ALTER TABLE public.ai_prompts DROP CONSTRAINT IF EXISTS ai_prompts_user_id_fkey;
ALTER TABLE public.ai_prompts DROP COLUMN IF EXISTS user_id;

CREATE INDEX IF NOT EXISTS idx_ai_prompts_type_version
  ON public.ai_prompts (type, version DESC);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_type_updated
  ON public.ai_prompts (type, updated_at DESC);

DROP INDEX IF EXISTS public.ai_prompts_one_active_per_type;
CREATE UNIQUE INDEX IF NOT EXISTS ai_prompts_one_active_per_type
  ON public.ai_prompts (type)
  WHERE is_active IS TRUE;

CREATE TABLE IF NOT EXISTS public.transaction_slug_assign_ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  ai_prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
  prompt_type TEXT NOT NULL DEFAULT 'transaction_slug_assign',
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

CREATE TABLE IF NOT EXISTS public.transaction_slug_assign_ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.transaction_slug_assign_ai_requests(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  raw_response TEXT,
  parsed_response_json JSONB,
  error_message TEXT,
  usage_input_tokens INTEGER,
  usage_output_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transaction_slug_assign_ai_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.transaction_slug_assign_ai_requests(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.transaction_slug_assign_ai_responses(id) ON DELETE SET NULL,
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

ALTER TABLE public.transaction_slug_assign_ai_requests
  DROP CONSTRAINT IF EXISTS fk_tsar_exchange;
ALTER TABLE public.transaction_slug_assign_ai_requests
  ADD CONSTRAINT fk_tsar_exchange
  FOREIGN KEY (exchange_id) REFERENCES public.transaction_slug_assign_ai_exchanges(id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS fk_transactions_last_slug_exchange;
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_last_slug_exchange
  FOREIGN KEY (last_slug_assign_exchange_id)
  REFERENCES public.transaction_slug_assign_ai_exchanges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tsae_transaction_created
  ON public.transaction_slug_assign_ai_exchanges (transaction_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tsar_transaction_id
  ON public.transaction_slug_assign_ai_requests (transaction_id);

CREATE INDEX IF NOT EXISTS idx_tsar_exchange_id
  ON public.transaction_slug_assign_ai_requests (exchange_id);

INSERT INTO public.ai_prompts (type, name, version, is_active, content)
SELECT
  'transaction_slug_assign',
  'Default slug assign v1',
  1,
  true,
  jsonb_build_object(
    'systemPrompt',
    'You assign stable merchant slugs to bank transactions. Respond with JSON only, no markdown.

Rules:
- Reuse a slug from existing_slugs when the transaction clearly matches that merchant.
- Otherwise create a new slug: lowercase letters, digits, and hyphens only; 2-40 characters; must start and end with a letter or digit.
- Do not include dates or amounts in the slug.
- matched_existing: true if the slug was chosen from existing_slugs, else false.
- confidence: one of high, medium, low.
- reason: one short sentence explaining the choice.

Output shape: {"slug":"...","matched_existing":true|false,"confidence":"high|medium|low","reason":"..."}'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE type = 'transaction_slug_assign' AND is_active = true
);
