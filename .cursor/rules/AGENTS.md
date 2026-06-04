# Personal Finances Express Server Rules

BEFORE implementing ANY feature, you MUST:
1. Read `.cursor/architecture/README.md`.
2. Read [011 – Personal Finances `/api/data` REST](../architecture/011-personal-finances-api-data.md) for HTTP layout.
3. Follow documented patterns EXACTLY.

## Domain Architecture
- Catalog CRUD lives in `src/data/{entity}/` with `router.ts`, `routes/`, `types.ts`, and one CRUD function per file.
- AI and multi-step flows live in `src/domains/{domain}/` or `src/services/{feature}/` with `processX()` functions.
- MUST use `type` and NEVER use `interface`.
- MUST use router factory pattern: `export const createXRouter(): Router`.
- ALWAYS keep routers thin: route definitions only, no business logic.

## Handlers
- MUST follow: (1) get managed client, (2) validate request, (3) call data or `processX`, (4) try/catch, (5) return response.
- Thin CRUD handlers may call `src/data/{entity}/` functions directly; orchestration handlers MUST use `processX()`.
- MUST add JSDoc to every router factory, handler, and business logic function.
- MUST use `sendSuccess`, `sendClientError`, `sendHandlerError` from `src/utils/http/`.
- MUST use status codes: `200` success, `400` client error, `500` server error.

## Data Layer
- MUST place database CRUD in `src/data/{entity}/`; NEVER inline queries in handlers or process functions.
- MUST keep one CRUD function per file with JSDoc.
- ALWAYS extract logic used 2+ times into `src/utils/{domain}/`.

## Services
- MUST use `getManagedSupabaseClient()` for Supabase; initialize once at startup.
- NEVER call `createClient()` in domain or handler code.
- ALWAYS check managed clients for `null` before use.

## Logging
- MUST use emoji prefixes: `🚀` `✅` `❌` `📥` `📤` `🤖` `💾`

## Quick Reference

- Architecture entrypoint → `.cursor/architecture/README.md`
- **Primary API layout** → `.cursor/architecture/011-personal-finances-api-data.md`
- File & domain organization → `.cursor/architecture/001-file-and-domain-organization.md`
- Router factory & handler pattern → `.cursor/architecture/002-router-factory-and-handler-pattern.md`
- Data layer CRUD → `.cursor/architecture/003-data-layer-crud-boundaries.md`
