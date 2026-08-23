# amandajuvera.com — full-stack

The portfolio, rebuilt as a full-stack app. The original static site still lives
in `../personal-site` and is what's deployed at amandajuvera.github.io; nothing
here touches it.

## What's here

| Feature | Where |
| --- | --- |
| Contact form → database | `app/contact`, `app/api/contact/route.ts` |
| Rate limiting + IP hashing | `lib/rate-limit.ts` |
| Admin dashboard (CRUD) | `app/admin/(protected)` |
| GitHub OAuth login | `auth.ts`, `app/admin/login` |
| Live GitHub repo stats | `app/api/sync/github/route.ts` |
| Projects from the DB | `app/projects/page.tsx` |

## Running it

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Everything except admin login works immediately — SQLite needs no accounts.

## Setup you have to do yourself

These need your own accounts, so they're left blank in `.env`:

**1. Admin login (GitHub OAuth)**

Create an OAuth app at <https://github.com/settings/developers>:

- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

Put the client ID and secret in `.env` as `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`,
and generate `AUTH_SECRET` with `openssl rand -base64 32`. Only the GitHub login
in `ADMIN_GITHUB_LOGIN` can sign in — everyone else is refused at sign-in.

**2. Real secrets**

`IP_HASH_SALT` and `SYNC_SECRET` ship with dev placeholders. Generate real ones
(`openssl rand -base64 32`) before deploying.

## Switching SQLite → Postgres

SQLite is here so the app runs with zero setup. The schema avoids enums and
database-specific column types, so moving to Postgres is:

1. Create a free database at <https://neon.tech> and copy the connection string.
2. Set `DATABASE_URL` in `.env` to that string.
3. Change `provider = "sqlite"` to `provider = "postgresql"` in
   `prisma/schema.prisma`.
4. `rm -rf prisma/migrations && npx prisma migrate dev --name init`
5. `npm run db:seed`

## Deploying

GitHub Pages cannot host this — it only serves static files, and this app needs
a server for the API routes, database, and auth. Deploy to Vercel instead:

1. Push this directory to its own GitHub repo.
2. Import it at <https://vercel.com/new>.
3. Add every variable from `.env.example` in the Vercel project settings, using
   the Neon connection string and freshly generated secrets.
4. Update the GitHub OAuth app's callback URL to
   `https://<your-domain>/api/auth/callback/github`.

## GitHub stats sync

`POST /api/sync/github` refreshes cached stars/forks/language/last-push for every
project with a `github.com` repo URL. It requires the `SYNC_SECRET` as a bearer
token:

```bash
curl -X POST localhost:3000/api/sync/github -H "Authorization: Bearer $SYNC_SECRET"
```

To run it nightly on Vercel, add `vercel.json`:

```json
{ "crons": [{ "path": "/api/sync/github", "schedule": "0 6 * * *" }] }
```

Vercel cron sends `Authorization: Bearer $CRON_SECRET`, so set `SYNC_SECRET` and
`CRON_SECRET` to the same value.

Without `GITHUB_TOKEN` the sync is capped at 60 requests/hour (unauthenticated
GitHub API limit). A token with no scopes raises it to 5000.

## Notes

- `npm audit` flags `deepmerge-ts` via `@prisma/config`. It's a build-time CLI
  dependency, not the runtime client, and the "fix" downgrades Prisma to a
  breaking older major. Left as-is deliberately.
