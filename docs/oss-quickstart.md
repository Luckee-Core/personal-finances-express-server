# OSS quickstart (web + Express)

Run the **Personal Finances** pair locally: Express API first, then the Next.js dashboard.

| Repo | URL |
|------|-----|
| Web | https://github.com/Luckee-Core/personal-finances |
| Express | https://github.com/Luckee-Core/personal-finances-express-server |

Governance pack: [mentorai-server `data/open-source/`](https://github.com/trouthouse-tech/mentorai-server/tree/main/data/open-source).

---

## Wire contract

| Field | Value |
|-------|-------|
| **Product name** | Personal Finances |
| **Default web port** | 3000 |
| **Default API port** | 3011 |
| **API base env (web)** | `NEXT_PUBLIC_SERVER_URL` |
| **Health endpoint** | `GET /api/health` (also `GET /`) |
| **Success JSON** | `{ success: true, data?, count?, message? }` |
| **Error JSON** | `{ success: false, error: string, message? }` |
| **Auth (OSS default)** | None — local/trusted operator; open CORS on Express |

---

## 1. Express API

```bash
cd personal-finances-express-server
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# Optional: ANTHROPIC_API_KEY for AI features

npm install
npm run dev
```

Default listen: **http://localhost:3011**

```bash
curl http://localhost:3011/api/health
```

Database: apply SQL per [`database-setup.md`](./database-setup.md).

### Mounted routes

| Prefix | Purpose |
|--------|---------|
| `GET /`, `GET /api/health` | Health |
| `/api/data/*` | Entity CRUD (bank accounts, transactions, categories, recurring purchases, loans, statement imports, AI audit tables, …) |
| `/api/ai/*` | AI workers (slug assign, category assign, recurring detect) |

---

## 2. Web app

```bash
cd personal-finances
cp .env.example .env.local

npm install
npm run dev
```

Set in `.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3011
```

Open [http://localhost:3000](http://localhost:3000) → dashboard routes under `/dashboard`.

---

## 3. Smoke test

1. Express health returns `success: true`
2. Web dashboard loads transactions and categories
3. Create a category or transaction — confirm JSON `{ success: true }` in network tab
4. (Optional) Upload a CSV statement import with Supabase + Anthropic configured

---

## Environment reference

### Web (client-visible)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SERVER_URL` | Rec (defaults `http://localhost:3011`) | Browser → Express |
| `NEXT_PUBLIC_GITHUB_*`, `NEXT_PUBLIC_THT_URL` | No | Landing/footer links |

### Express (server-only)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No (default 3011) | Listen port |
| `SUPABASE_URL` | **Yes** | Database |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server Supabase client |
| `ANTHROPIC_API_KEY` | For AI | Slug/category/recurring workers |
| `CORS_ORIGINS` | Deploy | Comma-separated browser origins (future) |

**Never** put service-role or Anthropic keys in `NEXT_PUBLIC_*`.
