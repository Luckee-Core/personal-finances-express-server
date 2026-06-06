# Architecture Documentation

This folder contains Architecture Decision Records (ADRs) for **personal-finances-express-server** conventions and implementation patterns.

## Why ADRs?

ADRs document:
- **What** standards we follow
- **Why** we chose them
- **How** to apply them consistently

## ADR index

| ADR | Topic | Status |
| --- | --- | --- |
| [001](./001-file-and-domain-organization.md) | File & domain organization |
| [002](./002-router-factory-and-handler-pattern.md) | Router factory & handlers |
| [003](./003-data-layer-crud-boundaries.md) | Data layer CRUD boundaries |
| [004](./004-managed-clients-and-startup-init.md) | Managed clients & startup |
| [005](./005-edge-functions-railway-only.md) | Edge functions → Railway only |
| [006](./006-logging-and-error-response-standards.md) | Logging & error responses |
| [009](./009-crm-file-vault-api-data.md) | **Superseded** — CRM template; use **011** instead |
| [010](./010-error-log-persistence.md) | **Deferred** — error log tables not implemented yet |
| [011](./011-personal-finances-api-data.md) | **Primary** — `/api/data` REST + Supabase |
| [012](./012-api-docs-catalog.md) | API docs catalog — `GET /api-docs.json` |

## How to use

1. Start with [011](./011-personal-finances-api-data.md) for HTTP and folder layout.
2. Open 001–003 and 006 for handler and CRUD rules.
3. Add new ADRs when decisions change—and **update this index**.

## Web client

Next.js app conventions: **personal-finances** `.cursor/architecture/` (especially [008 Express API boundary](../personal-finances/.cursor/architecture/008-express-api-boundary.md)).
