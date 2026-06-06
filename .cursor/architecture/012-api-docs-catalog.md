# 012 – API docs catalog (`/api-docs.json`)

## Status
Accepted

## Context
**personal-finances-express-server** exposes many `/api/data` and `/api/ai` routes (ADR 011). The Next.js app renders human-readable docs at `/docs` by fetching a machine-readable catalog from this server. No OpenAPI or third-party doc tools.

## Decision

### 1) Service location
- Catalog and router live in `src/services/api-docs/`.
- Pure helpers for CRUD doc templates live in `src/utils/api-docs/`.
- Do **not** place catalog code in `src/data/` (no database access).

### 2) Endpoint
- `GET /api-docs.json` returns `{ success: true, data: ApiDocsCatalog }` via `sendSuccess`.
- Mount `createApiDocsRouter()` in `index.ts` after health routes, before error middleware.

### 3) Handler rules
- No Supabase or managed clients — metadata-only route.
- Handler: `📥` log → `buildApiDocsCatalog()` → `sendSuccess` → `📤` log; `try/catch` → `sendHandlerError`.
- JSDoc on router factory, handler, and `buildApiDocsCatalog`.

### 4) Catalog maintenance
- Update `api-docs-catalog.ts` in the same PR when ADR 011 routes change.
- Paths must match `personal-finances-data-service.ts` and `ai-router.ts` mounts exactly.
- Use `buildCrudEntityDocs` for standard CRUD; hand-write action routes, multipart uploads, and AI workers.

### 5) Types
- Use `type` (not `interface`) in `src/services/api-docs/types.ts`.

## Consequences
- Web app fetches catalog through `src/api/api-docs/client.ts` (see personal-finances ADR 009).
- Catalog drift is a manual process — treat updates like README edits.

## Related
- [011 – Personal Finances `/api/data` REST](./011-personal-finances-api-data.md)
- personal-finances [009 – API docs page](../../personal-finances/.cursor/architecture/009-api-docs-page.md)
