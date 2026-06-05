# 011 – Personal Finances `/api/data` REST

## Status
Accepted

## Context
**personal-finances-express-server** exposes catalog CRUD and AI-adjacent resources to the Next.js app. This replaces template ADR 009 (CRM JSON file vault), which does not apply to this repo.

## Decision

### 1) Aggregator
`createPersonalFinancesDataService()` in `src/data/personal-finances-data-service.ts` mounts entity routers at `/api/data`:

| Mount path | Entity folder |
| --- | --- |
| `/bank-accounts` | `src/data/bank-accounts/` |
| `/credit-cards` | `src/data/credit-cards/` |
| `/categories` | `src/data/categories/` |
| `/transactions` | `src/data/transactions/` |
| `/recurring-purchases` | `src/data/recurring-purchases/` |
| `/anticipated-costs` | `src/data/anticipated-costs/` |
| `/loan-vendors` | `src/data/loan-vendors/` |
| `/loans` | `src/data/loans/` |
| `/not-recurring` | `src/data/not-recurring/` |
| `/statement-imports` | `src/data/statement-imports/` |
| `/ai-prompts` | `src/data/ai-prompts/` |
| `/llm-models` | `src/data/llm-models/` |
| `/*-ai-exchanges`, `/*-ai-requests`, `/*-ai-responses` | matching `src/data/` folders |

REST style: `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id` (not action paths like `/company/list`).

**Documented action-route exceptions** (orchestration subroutes on entity routers):

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/data/ai-prompts/:id/activate` | Set one prompt active for its type |
| `POST` | `/api/data/recurring-purchases/:id/mark-not-recurring` | Delete purchase and record slug in `not_recurring` |

### 2) Thin CRUD entity module
Each catalog entity under `src/data/{entity}/`:

```text
src/data/loans/
  router.ts              # createLoansRouter(): Router
  types.ts
  create.ts              # one CRUD function per file
  get-all.ts
  update.ts
  delete.ts
  index.ts
  routes/
    get-loans-handler.ts
    post-loan-handler.ts
    patch-loan-handler.ts
    delete-loan-handler.ts
```

**Thin CRUD handlers** may call data functions directly (no `processX` wrapper required) when the handler only validates transport, invokes one CRUD function, and maps errors.

Handler flow:
1. `requireSupabase(req, res)` (or `getManagedSupabaseClient()` + null check)
2. Validate route params (`parseRouteId` for `:id`) and optional body shape
3. `try` → call `createLoan` / `getAllLoans` / etc.
4. `sendSuccess` or `sendHandlerError` (validation throws → 400 via `isValidationError`)

**`:id` routes:** Every PATCH, DELETE, and GET-by-id handler must call `parseRouteId(req.params.id)` and `sendClientError(res, 'Invalid id')` when missing.

**POST routes:** Prefer lightweight handler checks for obvious missing fields (`name`, etc.) via `sendClientError`, then rely on data-layer validation for numeric bounds and DB rules. Data functions may `throw new Error('...')`; `sendHandlerError` maps messages matching `isValidationError` to **400**.

### 3) Orchestration (AI and multi-step flows)
Use `processX()` when logic coordinates AI, multiple tables, or non-trivial rules:

| Layer | Examples |
| --- | --- |
| `src/domains/{domain}/` | `transaction-slug-assign` — batch slug assignment |
| `src/services/{feature}/` | `transaction-category-assign`, `recurring-detect`, `statement-import` |

Handlers in `domains/*/routes/` or `services/*/routes/` delegate to `processX()`; CRUD stays in `src/data/`.

### 4) Response shape
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

Use helpers in `src/utils/http/responses.ts`: `sendSuccess`, `sendClientError`, `sendHandlerError`.

### 5) Persistence
Supabase tables via managed client at startup (`src/services/supabase/`). Migrations in `docs/supabase/*.sql`.

## Consequences
- Web app clients call `/api/data/{entity}` with `ApiResponse` mapping (see personal-finances ADR 008).
- New entities follow the thin CRUD module layout unless they need a `processX` orchestration layer.
- ADR 009 (CRM file vault) must not be used for reviews in this repo.

## Related
- [001 – File & domain organization](./001-file-and-domain-organization.md)
- [002 – Router factory & handler pattern](./002-router-factory-and-handler-pattern.md)
- [003 – Data layer CRUD boundaries](./003-data-layer-crud-boundaries.md)
