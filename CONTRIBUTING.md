# Contributing to SheAI

Thank you for helping make safety tools more accessible.

## Workflow

1. Read the README, SECURITY.md and AGENTS.md before changing behavior.
2. Discuss significant changes in a repository issue using synthetic examples only.
3. Work in a feature branch or fork with a separate development backend; never connect tests to live SheAI data.
4. Install with `bun install --frozen-lockfile`, configure local values from `.env.example`, and run `bun run dev`.
5. Add focused tests for changed safety rules, permissions, limits or sharing behavior; run `bun run test`.
6. Open a pull request describing the change, test results, accessibility impact and any remaining limitations. Never submit credentials, locations, phone numbers, medical information or screenshots containing real user data.

## Review requirements

- Emergency contacts need authoritative source URLs and accurate service scope. Do not assume a number works internationally, supports texting or covers an entire country.
- Preserve explicit country confirmation, owner-only data access and read-only token-based trip sharing.
- Describe SMS and WhatsApp messages as user-sent until a separately tested automatic service exists.
- Keep AI advice distinct from professional medical advice and emergency response.
- Check keyboard access, reduced motion and narrow-screen layouts for interface changes.
- Use original work or properly licensed contributions and preserve third-party notices.

Contributions are offered under the repository's MIT License. Maintainers review before merging; participation does not grant access to production or permission to represent SheAI.

Be respectful. Harassment, discriminatory behavior and disclosure of private information are not acceptable. Report security concerns privately as described in SECURITY.md, not in public issues.