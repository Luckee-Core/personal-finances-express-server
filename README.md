# Personal Finances Express Server

Express API for [personal-finances](https://github.com/Luckee-Core/personal-finances) — Supabase-backed CRUD and AI workers for personal finance tracking.

**OSS quickstart (web + Express):** [`docs/oss-quickstart.md`](docs/oss-quickstart.md).

OSS governance: [mentorai-server `data/open-source/`](https://github.com/trouthouse-tech/mentorai-server/tree/main/data/open-source).

## Quick start

```bash
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# Optional: ANTHROPIC_API_KEY for AI features

npm install
npm run dev
```

Default port: **3011** (matches web `NEXT_PUBLIC_SERVER_URL` dev default).

```bash
curl http://localhost:3011/api/health
```

Point the web app at this server:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3011
```

## Mounted routes

| Prefix | Purpose |
|--------|---------|
| `GET /`, `GET /api/health` | Health |
| `/api/data/bank-accounts` | Bank accounts |
| `/api/data/credit-cards` | Credit cards |
| `/api/data/categories` | Categories |
| `/api/data/transactions` | Transactions |
| `/api/data/recurring-purchases` | Recurring purchases (+ `POST /:id/mark-not-recurring`) |
| `/api/data/anticipated-costs` | Anticipated costs |
| `/api/data/loan-vendors` | Loan vendors |
| `/api/data/loans` | Loans |
| `/api/data/not-recurring` | Not-recurring slug markers |
| `/api/data/statement-imports` | CSV statement imports |
| `/api/data/ai-prompts` | AI prompts (+ `POST /:id/activate`) |
| `/api/data/llm-models` | LLM model catalog |
| `/api/data/*-ai-exchanges` | AI audit exchanges (slug, category, recurring) |
| `/api/data/*-ai-requests` | AI audit requests |
| `/api/data/*-ai-responses` | AI audit responses |
| `/api/ai/*` | AI workers (slug assign, category assign, recurring detect) |

Full aggregator: `src/data/personal-finances-data-service.ts`.

## Architecture

See [`.cursor/architecture/README.md`](.cursor/architecture/README.md) — start with [011 – `/api/data` REST](.cursor/architecture/011-personal-finances-api-data.md).

## Database

Supabase setup and SQL run order: [`docs/database-setup.md`](docs/database-setup.md).

## Local development and trust

**No authentication** in the OSS default. The API uses permissive CORS (`cors()`). **Do not** expose on a LAN or the internet without adding auth, HTTPS, explicit CORS, and rate limits. Bind to `127.0.0.1` or firewall port **3011** during local development if unsure.

Statement CSV uploads are limited to **5 MB** and CSV mime types only.

## Security

Report issues per [`SECURITY.md`](SECURITY.md). License: MIT — see [`LICENSE`](LICENSE). Release status: [`docs/oss-release-status.md`](docs/oss-release-status.md).

## Verification

```bash
npm run build
curl http://localhost:3011/api/health
```

Smoke with OSS web: load dashboard, list transactions, create a category, import a statement (when configured).
