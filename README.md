# Fresh Ticketing System (Testing / Teaching Project)

Prototype ticketing system built from scratch to demonstrate handling of a
"fresh work" ticket system: software/hardware/virus/network issues, remote
support tooling, custom fields, workflow, API, and payroll for support agents.

## Stack

- Node.js + Express (REST API)
- File-based JSON store (`src/data/db.json`) — no external DB/native deps required
- Vanilla HTML/CSS/JS frontend (no build step)

## Run it

```
npm install
npm start
```

Open http://localhost:3010

Demo accounts (seeded automatically on first run):

| Role     | Email               | Password    |
|----------|----------------------|-------------|
| Admin    | admin@demo.com       | admin123    |
| Agent    | agent@demo.com       | agent123    |
| Customer | customer@demo.com    | customer123 |

## Features mapped to requirements

1. **Fresh-build system** — built from zero, no framework boilerplate/template.
2. **Ticket testing for everything** — categories: software, hardware, virus, network, other; priority levels; full CRUD.
3. **API (Postman)** — see `postman/Fresh-Ticketing-System.postman_collection.json`, import into Postman and set the `token` variable after login.
4. **Workflow** — enforced state machine in [src/workflow.js](src/workflow.js): `new → assigned → in_progress → resolved → closed`, plus `reopened`. Invalid transitions are rejected by the API.
5. **Remote tools** — each ticket has a Remote Session panel (AnyDesk / TeamViewer / Chrome Remote Desktop + session ID/link).
6. **Custom fields** — admin-only field builder (`custom-fields.html`), no code changes needed to add new ticket attributes per category.
7. **Payroll** — agents log time spent per ticket (work log); `payroll.html` computes payable amount = hours x hourly rate, filterable by agent/date.
8. **UI panel** — dashboard with stat cards, ticket list with filters, ticket detail, custom field builder, payroll report — dark professional theme.

## Ticketing documentation

### Roles

| Role | Can do |
|---|---|
| Admin | everything: manage tickets, assign agents, build custom fields, view payroll |
| Agent | view tickets assigned to them or unassigned, work tickets, log time, use remote tools |
| Customer | create tickets, view/comment on their own tickets |

### Ticket categories

`software`, `hardware`, `virus`, `network`, `other` — set per ticket, used to scope which custom fields apply.

### Priority levels

`low`, `medium`, `high`, `critical`.

### Workflow (status state machine)

```
new ──────► assigned ──────► in_progress ──────► resolved ──► closed
 │              │                  │                 │           │
 └──► closed    ├──► closed        └──► assigned      └──► reopened ──► closed
                └──► new                                          │
                                                                    └──► assigned / in_progress
```

Transitions are enforced server-side in [src/workflow.js](src/workflow.js) — the API
rejects any status change that isn't in the allowed-next list for the ticket's
current status.

### Remote support tooling

Every ticket has a Remote Session panel to record which tool was used to work
the issue (AnyDesk, TeamViewer, Chrome Remote Desktop) and the session ID or
connection link, so there's an audit trail of remote access per ticket.

### Custom fields

Admins can add ticket attributes without touching code, from **Custom Fields**
in the sidebar: field name/key, display label, type (text, number, dropdown,
checkbox, date), which category it applies to (or "all"), and whether it's
required. Required fields are validated when a ticket is created for a
matching category.

### Payroll

Agents log time spent per ticket (minutes + optional note) from the ticket
detail page. The **Payroll** page (admin-only) aggregates logged minutes per
agent into hours, multiplies by each agent's hourly rate, and reports a
payable amount — filterable by agent and date range.

### API testing

Import `postman/Fresh-Ticketing-System.postman_collection.json` into Postman.
Run **Auth → Login (admin)** first, copy the returned `token` into the
collection's `token` variable, then the rest of the requests (Tickets, Custom
Fields, Payroll) will authenticate automatically via the `Authorization:
Bearer {{token}}` header.

## Deploying to Render (free tier)

This app needs **no `.env` file and no database service** to run — it only
reads the `PORT` environment variable, which Render sets automatically.

1. Push this repo to GitHub (already done).
2. On Render: **New → Web Service** → connect this repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. No environment variables required.

**Storage caveat:** data is stored in a local JSON file
(`src/data/db.json`), not a database. On Render's free tier the disk is
ephemeral — every redeploy, and every time the free instance spins down after
~15 minutes of inactivity and wakes back up, ticket data resets to the seed
data. This is fine for demoing the UI/API/workflow, but not for retaining
real ticket data. If persistence is needed later, swap `src/db.js` for a
Postgres-backed implementation (e.g. Render's free Postgres add-on +
`DATABASE_URL` env var) — the rest of the app (routes, workflow, frontend)
doesn't need to change.

## Project structure

```
server.js                 entrypoint
src/db.js                 file-based JSON persistence + seed data
src/workflow.js           status transition rules, categories, priorities
src/middleware/auth.js     token-based auth + role guard
src/routes/                auth, tickets, customFields, payroll, users
public/                    frontend pages (login, dashboard, tickets, ticket detail, custom fields, payroll)
postman/                   Postman collection for API testing
```

## Notes on IP protection (for contest submission)

This repository is submitted as a demo/prototype for evaluation purposes only.
See [LICENSE](LICENSE) — full rights remain with the author until a formal
contract and payment are in place. Repository access should be shared as
view-only, and this repo should be kept private.
