# Security policy

SheAI handles potentially sensitive location, contact and health information. Source availability is not evidence of a completed security audit.

## Reporting

Use the repository's **Security → Report a vulnerability** option if maintainers have enabled GitHub private vulnerability reporting. Never post an exploit, active trip token, credential or personal record in a public issue.

If private reporting is unavailable, ask maintainers to enable a private channel through a public issue containing only the request, not the vulnerability. A dedicated security email and response SLA have not yet been established. Maintainers must enable a working private reporting channel before public release.

Provide affected version, impact and reproduction steps using a synthetic account in an isolated test deployment. Do not test against live users, send emergency calls/texts, scrape shared trips or attempt to access someone else's records.

## Deployment boundaries

- Secrets remain server-side. `VITE_` variables and publishable backend keys are public configuration, not authorization.
- Keep row-level security, SQL grants, protected profile fields and database-enforced limits intact.
- Verify a bearer token before AI credit consumption and model calls.
- Never expose anonymous direct reads of the trips table; shared views use the dedicated token function.
- Treat a shared trip URL as a bearer capability: anyone holding it may see the shared trip. Do not put real links in issues or logs.
- Do not assume location/health fields or carrier SMS are end-to-end encrypted.

## Before making the repository public

Review **all branches and history**, not only the current folder. The managed workspace tracks an environment file; adding an ignore entry alone would not remove tracked files or previous versions. Use the clean-release process in docs/OPEN_SOURCE_RELEASE.md. Rotate/revoke any accidentally exposed private credentials through the service that issued them. Do not rewrite the Lovable-synced repository's history as a cleanup shortcut.

Only the current main source is a maintenance target; no guaranteed support or incident response window is promised.