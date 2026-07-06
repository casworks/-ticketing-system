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
