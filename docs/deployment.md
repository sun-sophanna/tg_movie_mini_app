# Deployment

## Frontend (Vercel)

- Root: `apps/web`
- Build: `pnpm run build` (or `pnpm --filter @movie/web build`)
- Env: `VITE_API_URL=https://your-api.example/api/v1`
- Do not proxy video through Vercel functions.

## Backend

Prefer Railway, Render, Fly.io, or a VPS for long-lived Node + Neon pooling.

Env: copy `apps/api/.env.example`. Run `pnpm run migration:run` on deploy.

For Telegram-hosted videos **over 20 MB**, deploy [Local Bot API](./telegram-local-bot-api.md) alongside the API and set `TELEGRAM_API_BASE_URL` / public `TELEGRAM_FILE_BASE_URL`.

## Neon

- SSL required (`?sslmode=require`).
- Use pooler for serverless-like hosts; avoid opening a new connection per request.
