<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Open-source code and documentation use MIT; preserve third-party notices and document managed-service dependencies and unimplemented features, so source access is not mistaken for an operational safety service.
- Signed-in pages live under `src/routes/_authenticated/` and share `AppShell`; SOS (`/sos`) and shared trip links (`/t/$token`) stay public so they work without login.
- Plan limits (trusted contacts, AI credits, trial) are enforced in the database (triggers / SECURITY DEFINER functions), never only in the UI — users cannot edit plan or credit columns.
- AI chat streams from the `/api/chat` server route, which verifies the bearer token and calls `consume_ai_credit` before any model call.
- Shared trips are read only through `get_shared_trip(token)`; never add an anon policy on `trips`.
- Emergency contacts live in a source-linked country directory; require country confirmation before dialing and never infer physical location from language alone.
- Journey sharing uses shared message helpers for SMS and WhatsApp; messages are user-sent, never represented as automatic dispatch.
