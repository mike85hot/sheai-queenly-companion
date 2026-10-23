# SheAI

**Built for Women** · Browser-based safety and everyday well-being tools

Live application: [sheai.live](https://sheai.live)

SheAI brings practical safety tools, consent-based journey sharing and AI-assisted well-being into one browser experience. This repository's original application code and documentation are licensed under the [MIT License](LICENSE), allowing reuse, modification and commercial or non-commercial distribution. Source licensing does not publish user records or grant access to the hosted service.

## What is implemented

| Capability | Current scope |
| --- | --- |
| Public SOS | Country confirmation, source-linked emergency contacts and crisis support, siren/strobe, simulated Safe Exit Call; no login required |
| International directory | Nigeria, Kenya, South Africa, India, Pakistan, Philippines, United Kingdom, United States and Canada; some services have regional or device restrictions |
| Trusted contacts | Account-based contact management with database-enforced plan limits |
| Walk Me Home | Browser location updates, arrival timer, shared trip link, safe/duress codewords and user-initiated SMS/WhatsApp sharing |
| AI assistants | Safety/travel, meals and fitness/cycle guidance with database-enforced credit accounting |
| Accounts | Sign-in and emergency profile details |

**Not implemented:** automatic SMS dispatch, predictive risk scoring, crime/incident mapping, backup hotel booking, offline service-worker support and paid checkout/subscription integration. Marketing prices do not establish payment functionality. The app does not contact emergency responders automatically, and browser tracking is not guaranteed when a device is locked, offline or suspends the page. AI guidance is not medical advice or an emergency service.

## Development

Prerequisites: Bun, a modern browser and a separate development backend. The stack is React 19, TypeScript, TanStack Start, Tailwind CSS, PostgreSQL-backed auth/data services and Vercel AI SDK. Never develop against live users' data.

1. Clone your published source repository and open its root directory.
2. Install locked dependencies: `bun install --frozen-lockfile`.
3. Copy `.env.example` to `.env` and configure your own development values. All `VITE_` values are browser-visible; never place private credentials there.
4. Provision your development database/auth services and apply the repository's SQL schema in migration order, preserving grants, row-level security and functions. See [deployment notes](docs/DEPLOYMENT.md); this is not an automatic one-command setup.
5. Run `bun run dev` and use the local URL printed by Vite.
6. Run `bun run test` before proposing changes. `bun run build` produces deployment output for a separately configured host.

Cloning source does **not** transfer Lovable Cloud users, storage, provider configuration, service credentials or AI access. Social login uses the Lovable auth integration; an independent deployment must configure or adapt that integration. AI currently depends on authorized Lovable AI Gateway access. No independent self-hosted installation has been validated.

## Contribute safely

Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and [the privacy/safety architecture](docs/PRIVACY_AND_SAFETY.md). Use synthetic data and a separate backend. Verify emergency numbers against authoritative sources; never infer someone's physical location from their language.

## License and attribution

- Original code and documentation: MIT; retain the license and copyright notice.
- Dependencies retain their own licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- SheAI's name and logo are brand identifiers, not a license to imply official affiliation. Rebrand independent deployments; confirm asset rights before redistribution.
- No UN endorsement, program acceptance, security certification or Digital Public Good recognition is claimed.

## Release status

Public source: [mike85hot/sheai-queenly-companion](https://github.com/mike85hot/sheai-queenly-companion), published on 23 October 2026 under MIT. The initial history-wide credential scan found only public client configuration warnings, and all 16 existing tests passed. This is not a security certification or an independently validated self-hosted deployment. Contributor/media rights and UNICEF applicant eligibility still require owner confirmation; see [the release checklist](docs/OPEN_SOURCE_RELEASE.md).
