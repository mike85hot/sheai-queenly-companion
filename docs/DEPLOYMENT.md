# Development and independent deployment

## Existing hosted application

SheAI runs on Lovable Cloud. Git sync transfers source, not users, database records, provider settings or managed credentials. Do not connect a fork to the production backend. Lovable-managed service-role credentials and database passwords are not exportable from this project.

## Separate development environment

Use `.env.example` as a variable-name template with credentials from a backend you operate. The current client expects PostgreSQL-backed auth/data/RPC APIs compatible with its installed SDK; plain PostgreSQL alone does not supply those APIs.

Review the SQL under `drizzle/migrations/` in order before applying it to an empty isolated backend. Include tables, functions, auth lifecycle triggers, grants and row-level security. Do not copy production records or private exports. Migration files do not configure email, OAuth, redirect URLs or storage. Git synchronization does not apply SQL migrations.

Run `bun install --frozen-lockfile`, then `bun run dev` and `bun run test`. Keep local credentials untracked in the independent repository. The managed editor's ignore file cannot be updated here; inspect your own repository before committing environment files.

## Known portability work

- **Authentication:** social sign-in uses the Lovable broker integration. An independent operator must arrange supported access or adapt the login integration and redirects, then test session hydration and protected pages.
- **AI:** `/api/chat` uses Lovable AI Gateway, a server-held `LOVABLE_API_KEY` and Gateway-specific model identifiers/options. An alternative provider requires code changes, not just changing a key. Preserve token verification, credit enforcement, streaming and safe failure behavior when adapting it. The language model/service is not included in the MIT source release.
- **Build/runtime:** TanStack Start uses the Lovable Vite configuration and a serverless Worker target. Verify package access and configure an appropriate deployment target. Do not assume this is a static-only application or a generic Node server.
- **Media:** verify asset-pointer URLs remain available and obtain legally redistributable local copies when needed; see THIRD_PARTY_NOTICES.md.

## Verification before serving real users

Test signup/sign-in, owner isolation with two synthetic users, contacts limits, AI credits, public SOS country confirmation, location permissions, trip share/read-back and safe/duress behavior. Check browser suspension and network-loss cases on real phones. Use synthetic recipients and do not call real emergency numbers or automatically text anyone. Independently review security, licensing and consent/retention policies.

The current release preparation has not validated a fresh self-hosted deployment.