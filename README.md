# Telegram Movie Mini App

Mobile-first movie streaming Mini App for Telegram: NestJS API, React (Vite) web client, Neon PostgreSQL, Telegram channel video storage (MVP).

**Location:** `d:\PROJECTS\NEST\telegram-movie-app` (separate from `multi-tenant-core`).

## Stack (aligned with multi-tenant-core / cpm-frontend-v2)

| Layer | Versions |
|-------|----------|
| API | NestJS 11, TypeORM 0.3, PostgreSQL (`pg`), Swagger, Helmet, Throttler |
| Web | React 18, Vite 6, Ant Design 6, Tailwind 4, TanStack Query 5, Zustand, react-router-dom 7 |
| Tooling | pnpm workspaces, TypeScript 5.7, Jest (API) |

## Structure

```text
telegram-movie-app/
├── apps/api/          NestJS REST API
├── apps/web/          Telegram Mini App (Vite)
├── packages/types/    Shared DTO types
├── packages/shared/   Small shared helpers
└── docs/              Architecture, auth, POC, deployment
```

## Quick start

```bash
cd d:\PROJECTS\NEST\telegram-movie-app
pnpm install

# API
cp apps/api/.env.example apps/api/.env
# Database — pick one:
#   Neon: create free project at https://neon.tech → copy connection string into apps/api/.env
#   Docker: pnpm run docker:db:up → use DATABASE_URL from apps/api/.env.example (Option B)
pnpm run migration:run
pnpm run start:api:dev

# Web
cp apps/web/.env.example apps/web/.env
pnpm run start:web
```

- API: `http://localhost:3000/api/v1` · Swagger: `http://localhost:3000/docs`
- Web: `http://localhost:5173` · POC player: `/poc`
- Local auth mock: `VITE_ENABLE_TELEGRAM_MOCK=true` + `TELEGRAM_MOCK_AUTH_ENABLED=true` (non-production only)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run start:api:dev` | API watch mode |
| `pnpm run start:web` | Vite dev server |
| `pnpm run build` | Build API + web |
| `pnpm test` | Jest (Telegram auth, cache) |
| `pnpm run migration:run` | Apply SQL migrations |
| `pnpm run seed:dev` | Sample catalog (after migration) |
| `pnpm run docker:telegram-api:up` | Local Bot API on `:8081` (large files; needs `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` in root `.env`) |

## Telegram setup (summary)

Step-by-step checklists: **`docs/telegram-file-id.md`** (what you need to do) · **`docs/telegram-local-bot-api.md`** (files over 20 MB).

1. Create bot via [@BotFather](https://t.me/BotFather), set `TELEGRAM_BOT_TOKEN`.
2. Create private channel, add bot as admin, upload videos, store `file_id` on episodes — follow **Path A or B** in `docs/telegram-file-id.md`.
3. Configure Mini App URL in BotFather → your Vercel/web URL.
4. For videos over 20 MB: **`docs/telegram-local-bot-api.md`** → Docker + `TELEGRAM_API_BASE_URL`.
5. Run video POC (`/poc`, `docs/telegram-video-poc.md`) before production go-live.

## Deployment

- **Frontend:** Vercel (static; do not proxy video bytes).
- **Backend:** Railway / Render / Fly.io / VPS recommended for Nest + Neon pooling.
- **Database:** Neon with SSL and migration on deploy.

See `docs/deployment.md`, `docs/telegram-file-id.md`, `docs/telegram-local-bot-api.md`, and `docs/telegram-video-poc.md`.
