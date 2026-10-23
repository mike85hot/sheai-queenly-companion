# Public release and UN application checklist

## Prepared in this repository

- MIT license and package license metadata.
- Project README with implemented-versus-planned features.
- Contribution guidance, security reporting policy and privacy/safety architecture.
- Environment variable template with no live values.
- Deployment limitations and third-party/asset attribution guidance.

## Owner actions before publication

1. Confirm the team has the rights to release its original code under MIT; review any contributor or contractor agreements. Confirm logo/media rights separately.
2. On desktop, connect through **Project settings → Git → GitHub**. On mobile, use **Chat → + → Project → GitHub**, or project Settings → Git. Connecting creates a new private repository; the assistant cannot connect it or check its status.
3. **Keep the synced repository private during review.** Audit every tracked file, branch and historical commit for secrets, user information, private working documents and unlicensed material. The managed workspace currently tracks `.env`; its current values are publishable configuration, but neither that fact nor an ignore rule proves the rest of history is safe.
4. The safest release for a history that has not been fully cleared is a **separate clean public repository** containing only approved source. This is not the Lovable-synced repository; updates must be reviewed and copied separately. Exclude `.git`, `.env` and other real environment files, `.dev.vars`, `.workspace`, private `.lovable` working metadata, dependencies, generated build output, database exports, logs, sessions and test data containing real people. Retain `.env.example`, the lockfile, configuration, migrations, tests and licensing documents. Review auto-generated clients/config for live project identifiers as well as credentials; replace deployment-specific values in the release copy where appropriate. Never rewrite synced history to perform cleanup.
5. Review dependencies and obtain/verify media rights using THIRD_PARTY_NOTICES.md. Enable GitHub private vulnerability reporting and secret scanning where available. Add the actual maintainers and private reporting channel.
6. Install dependencies and run tests from the clean release. Document any independently verified deployment; do not describe an untested fork as turnkey.
7. Create the public repository only after review (or change visibility in **GitHub repository Settings → General → Danger Zone** after clearing a private release). GitHub may require a desktop browser on mobile. Confirm the repository, README and LICENSE are readable while signed out.
8. Record its real URL and an initial release tag in the application. Do not use the live website URL as the source repository URL.

## UN program application

The target is [UNICEF FemTech Ventures' second call](https://www.unicef.org/innovation/FemTechCall), reviewed on 23 October 2026. The official call lists an application deadline of **4 November 2026**, up to **US$100,000** funding and 12 months of technical mentorship. It seeks companies registered in a UNICEF programme country, a functional prototype and commitment to open-source licensing and principles. Women-led startups and founders under 35 are strongly encouraged; the page does not describe those as universal mandatory conditions. SheAI's closest thematic fit is **Pillar 3: Mental wellbeing, safety and protection**. See [the application brief](UNICEF_FEMTECH.md).

Company registration, full applicant eligibility and application-form requirements remain unverified. Open source alone does not guarantee eligibility, acceptance, endorsement or Digital Public Good status.

Check the exact call for: accepted license, public repository requirement, applicant/team eligibility, geography, deadlines, safeguarding/privacy obligations and evidence of a working pilot. Describe automation, predictive risk and offline support as planned, not operational.

**Suggested wording after publication:**

> SheAI releases its original application code under the MIT License so partners can inspect, adapt and contribute to browser-based safety tools. Our hosted application combines public emergency tools with account-based journey sharing and AI-assisted well-being. The public source repository documents current capabilities, service dependencies and safety limitations; user data and private credentials are not part of the release.

Attach the actual public repository URL, license link, live demo and verified test/pilot evidence. Use this wording only after the public release is confirmed.