# Exchange tables inventory (personal-finances)

**Purpose:** Catalog for AI cost display. Tokens live on `*_exchanges` rows (`input_tokens`, `output_tokens`, `model_used`, `created_at`). Do not register tables where those columns are missing.

| `logical_key` | `table_name` | `occurred_at_column` | `input_tokens_column` | `output_tokens_column` | `model_column` |
| --- | --- | --- | --- | --- | --- |
| transaction_slug_assign | `transaction_slug_assign_ai_exchanges` | `created_at` | `input_tokens` | `output_tokens` | `model_used` |
| transaction_category_assign | `transaction_category_assign_ai_exchanges` | `created_at` | `input_tokens` | `output_tokens` | `model_used` |
| recurring_detect | `recurring_detect_ai_exchanges` | `created_at` | `input_tokens` | `output_tokens` | `model_used` |

Seed rows: `007b_exchange_table_registry.sql`.
