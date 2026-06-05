# Security

## Supported use

**Local / trusted development** is the primary assumption for this open-source API. You run Express on your machine, paired with [personal-finances](https://github.com/Luckee-Core/personal-finances).

**There is no authentication layer in the OSS default.** The API accepts requests from any origin allowed by CORS (`cors()` defaults are permissive).

**Before exposing this server on a LAN or the internet:** enforce authentication and authorization on every mutating route, bind to `127.0.0.1` or firewall the port, use HTTPS, configure `CORS_ORIGINS` explicitly, and add rate limits on `/api/ai/*` and CSV upload routes.

## Reporting a vulnerability

**Do not** post exploit details in public issues before a fix is coordinated.

### GitHub private security advisories (preferred)

1. Open this repository on GitHub.
2. Go to the **Security** tab.
3. Use **Report a vulnerability** (private submission).

### Maintainer contact

If private advisories are unavailable, open a minimal public issue asking for a security contact — do not include exploit steps.

## Scope and limitations

- **Service-role Supabase keys** and **Anthropic API keys** must stay server-only — never in client bundles or `NEXT_PUBLIC_*` env.
- Statement import accepts CSV uploads up to **5 MB** via multer; validate files before processing in untrusted deployments.
- AI routes (`/api/ai/*`) can incur API cost; protect with auth and rate limits when exposed.

## Audit resources

Pre-release guides: [mentorai-server `data/open-source/`](https://github.com/trouthouse-tech/mentorai-server/tree/main/data/open-source). Release status: [`docs/oss-release-status.md`](docs/oss-release-status.md).

## Versions

Security fixes apply to the **default branch** unless maintainers publish a separate support policy.
