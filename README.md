# Ashis Kumar Sahu — Personal Portfolio CMS

A self-hosted portfolio with a built-in CMS admin panel. All content (profile, projects, certifications, resume) is stored in a Neon PostgreSQL database and managed through a password-protected admin dashboard — no external CMS required.

## Stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | React 19 + Vite + Tailwind CSS 4 + wouter |
| Backend | Express 5 + Node.js |
| Database | Neon (serverless Postgres) via `@neondatabase/serverless` |
| Auth | bcrypt passwords + JWT (24 h tokens) |
| ORM | Drizzle (schema definition only; queries use raw SQL) |

## Project structure

```
artifacts/
  portfolio/        # React + Vite frontend (portfolio site + admin panel)
  api-server/       # Express API server (all /api/* routes)
lib/
  db/               # Drizzle schema definitions
scripts/            # Workspace utility scripts
```

## Running locally

```bash
# Install dependencies
pnpm install

# Start both services (each in its own terminal)
pnpm --filter @workspace/api-server run dev   # API on :8080
pnpm --filter @workspace/portfolio run dev    # Vite on :5173
```

Required environment variables (set in `.env` or Replit Secrets):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon connection string (pooled) |
| `SESSION_SECRET` | Random string used to sign JWTs |

## Database setup

Run `artifacts/portfolio/schema.sql` once in your Neon SQL editor to create all tables. Then create your admin account:

```bash
curl -X POST https://<your-domain>/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"userId":"yourname","password":"yourpassword"}'
```

## Admin panel

Navigate to `/admin/login` on your deployed site. Log in with the credentials you created above. The dashboard lets you edit:

- **Profile** — name, tagline, bio, photo, social links, focus, philosophy, tech stack
- **Projects** — add/edit/delete/reorder, toggle published, link to GitHub & live demo
- **Certifications** — add credentials with badge image, issue/expiry dates, verify URL
- **Resume** — PDF download link and last-updated date
- **Security** — change your admin credentials

## API routes

All routes are under `/api`:

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/healthz` | — | Health check |
| `POST` | `/auth/setup` | — | Create admin account (one-time) |
| `POST` | `/auth/login` | — | Login, returns JWT |
| `GET/PATCH` | `/profile` | PATCH: JWT | Site profile |
| `GET` | `/projects` | — | Published projects (all if JWT) |
| `POST/PATCH/DELETE` | `/projects/*` | JWT | Manage projects |
| `GET/PATCH` | `/resume` | PATCH: JWT | Resume metadata |
| `GET` | `/certifications` | — | Published certs (all if JWT) |
| `POST/PATCH/DELETE` | `/certifications/*` | JWT | Manage certifications |

## Deployment

The frontend (`artifacts/portfolio`) builds to a static Vite bundle. The API server (`artifacts/api-server`) is a standard Node.js/Express process. Deploy both — frontend can be on Vercel/Netlify/Replit, API on any Node host — and point `VITE_API_BASE` at the API origin if they differ.
