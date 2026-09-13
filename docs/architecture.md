# Architecture

```text
Telegram Mini App (React)
        │  Authorization: tma <initData>
        ▼
NestJS API (/api/v1)
        ├── Neon PostgreSQL (catalog, users, favorites, history)
        └── VideoProvider → Telegram Bot API → private channel
```

## Boundaries

- **Repositories / services:** controllers do not use TypeORM directly for complex flows.
- **VideoProvider:** `TelegramVideoProvider` today; S3/R2/Bunny later via the same interface.
- **Cache:** in-memory `CacheService` contract; Redis/Valkey-ready.
- **Auth:** HMAC validation of `initData`; mock prefix `mock:` only when `NODE_ENV !== production` and `TELEGRAM_MOCK_AUTH_ENABLED=true`.

## Public vs protected routes

Catalog reads (`@Public()`) skip Telegram auth. Favorites, watch history, and `/episodes/:id/play` require valid `tma` auth.
