# Database setup (Supabase)

Personal Finances stores catalog data in **Supabase Postgres**. Apply SQL migrations in order below.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **service role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only; never in the web app)

## 2. Run migrations

Open the Supabase SQL editor (or your migration tool) and run files from [`docs/supabase/`](./supabase/) **in this order**:

| Order | File | Notes |
|-------|------|-------|
| 1 | `001_initial_schema.sql` | Core tables |
| 2 | `002_rename_accounts_to_bank_accounts.sql` | **Only** if you applied an older `001` with `accounts` |
| 3 | `003_transaction_slugs_ai_prompts_and_audit.sql` | Slug assign + prompts |
| 4 | `004_recurring_detect_ai_prompt.sql` | Recurring detect prompt seed |
| 5 | `005_recurring_daily_billing_interval.sql` | Billing interval column |
| 6 | `006_transaction_category_assign_ai.sql` | Category assign AI tables |
| 7 | `007_llm_models.sql` | LLM model catalog |
| 8 | `007b_exchange_table_registry.sql` | Exchange registry |
| 9 | `008_recurring_detect_ai_audit.sql` | Recurring detect audit |
| 10 | `009_category_assign_transfers_prompt.sql` | Prompt update |
| 11 | `010_category_assign_withdraw_not_transfer.sql` | Prompt update |
| 12 | `011_category_assign_prompt_semantics.sql` | Prompt update |
| 13 | `012_category_assign_dda_withdraw_prompt.sql` | Prompt update |
| 14 | `013_category_assign_no_slug.sql` | Prompt update |
| 15 | `014_credit_cards.sql` | Credit cards |
| 16 | `015_not_recurring.sql` | Not-recurring slugs |
| 17 | `016_anticipated_costs.sql` | Anticipated costs |
| 18 | `017_loans.sql` | Loans |
| 19 | `018_loan_vendors_table.sql` | Loan vendors |

Fresh installs: run **001**, then **003–018** (skip **002** unless noted).

## 3. Verify

```bash
curl http://localhost:3011/api/health
curl http://localhost:3011/api/data/categories
```

Expect `{ "success": true, ... }` when Supabase is configured.

## Related

- Express env: [`.env.example`](../.env.example)
- Pair quickstart: [`oss-quickstart.md`](./oss-quickstart.md)
