# OSS release status

**Product:** Personal Finances (Express API)  
**Pair:** [personal-finances](https://github.com/Luckee-Core/personal-finances)  
**License:** MIT  
**Score:** Ship (with documented local-only auth gap)

## Checklist (express + pair)

| Section | Status |
|---------|--------|
| Legal (LICENSE, CONTRIBUTING, no secrets) | Pass |
| README, .env.example, SECURITY.md | Pass |
| Database runbook | Pass — `docs/database-setup.md` |
| Wire contract | Pass — `docs/oss-quickstart.md` |
| Express benchmark (routers, data layer, logging) | Pass |
| CI (build, audit) | Pass |
| Auth for production | **Gap** — no auth; documented in SECURITY.md |

## Known debt (acceptable for v0.1.0)

- No rate limiting on `/api/ai/*`
- Permissive default CORS
- ADR 010 error log persistence not implemented
