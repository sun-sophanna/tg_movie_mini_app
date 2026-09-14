# Deployment

## Frontend (Vercel)

- Root: `apps/web`
- Build: `pnpm run build` (or `pnpm --filter @movie/web build`)
- Env: `VITE_API_URL=https://your-api.example/api/v1`
- Do not proxy video through Vercel functions.

## Backend (Railway + Railpack)

Railpack needs a **start** command. This repo provides:

- Root `package.json` → `"start": "node dist/apps/api/main.js"`
- `railpack.json` → build `pnpm run build:api`, same start command

In Railway **Variables**, set env from `apps/api/.env.example` (`DATABASE_URL`, `CORS_ORIGINS`, `API_PUBLIC_BASE_URL`, etc.). Run migrations once: `pnpm run migration:run` (locally with production `DATABASE_URL` or `railway run`).

**Networking:** service **Settings → Public networking → Generate domain** → use `https://<domain>/api/v1` as `VITE_API_URL` on Vercel.

Optional overrides: `RAILPACK_START_CMD` or `RAILPACK_BUILD_CMD` in Railway if you change scripts.

Prefer Railway, Render, Fly.io, or a VPS for long-lived Node + Neon pooling.

For Telegram-hosted videos **over 20 MB**, deploy [Local Bot API](./telegram-local-bot-api.md) alongside the API and set `TELEGRAM_API_BASE_URL` / public `TELEGRAM_FILE_BASE_URL`.

## Neon

- SSL required (`?sslmode=require`).
- Use pooler for serverless-like hosts; avoid opening a new connection per request.
