# Privacy and safety architecture

This describes the current source design, not a legal privacy policy, threat-model certification or guarantee of personal safety.

## Data and trust boundaries

| Data | Purpose and boundary |
| --- | --- |
| Account/authentication | Managed backend authentication; protected pages require sign-in |
| Emergency profile | Optional personal and health details; owner-scoped records |
| Trusted contacts | Phone/contact records used for user-initiated sharing |
| Trips | Location updates and trip state; owner access plus a dedicated read-only shared-token function |
| AI conversation | Submitted messages and selected mode/context are sent through the AI Gateway to the model service |
| Credits and plans | Database-enforced accounting; users cannot directly edit entitlement columns |

Public SOS does not require an account. Emergency-country confirmation is explicit; locale may suggest a country but does not establish physical location. Directory entries link to their sources and preserve regional/device restrictions.

## Journey sharing risks

Sharing a token link grants its holder access to the trip view. SMS/WhatsApp sharing opens an external service and requires the user to send the message. It is not an automatic dispatch system, and ordinary SMS must not be described as encrypted. Users should share only with people they trust. Browser permissions, connectivity and background suspension can interrupt updates; a countdown or overdue state does not guarantee that anyone receives help.

## Emergency and AI limitations

Safe Exit Call is a simulation, not a real incoming call. Siren and strobe depend on the device/browser and can expose a user's actions; strobe may be unsafe for photosensitive users. Never test emergency dialing by calling a real emergency service unnecessarily.

AI may be wrong and is not clinical care, crisis counseling or a reliable risk predictor. Avoid submitting identifying medical/location details to AI. Provider retention, hosted settings and legal compliance require an operator review; source inspection alone cannot establish them.

## Deployment responsibilities

Before a public pilot, operators need a published privacy notice, consent and data-retention/deletion procedures, a tested private security channel, safeguarding review, real-device checks and jurisdiction-specific review for youth use. These documents do not establish that those processes are already in place. Open-source release must never include user records, exports, logs, sessions or credentials.