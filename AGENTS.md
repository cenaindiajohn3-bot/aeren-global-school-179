<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep school workflows on separate authenticated TanStack routes with a shared portal shell; public home exposes demo aggregates only.
- Enforce school permissions and atomic publication with PostgreSQL functions and RLS; privileged account provisioning runs only in authorized server handlers.
- Map normalized school UIDs to deterministic synthetic email identities; accounts are provisioned confirmed by authorized staff, not public signup.
- Define all portal visual styles and semantic colors in src/styles.css so navigation, reports and account pages share one design system.
- Super Admin password setup uses the managed Google broker returning to the public password page; validate the authenticated active school role before showing the form, and never assign roles from OAuth email or client state.
- Account provisioning must authorize the active role before loading the privileged client; share fail-closed permission helpers with tests to prevent UI/server drift.
