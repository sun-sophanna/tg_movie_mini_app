# Telegram video POC

## Goal

Validate whether Telegram Bot API file delivery is acceptable as the MVP video origin before full production traffic.

## What you need to do

1. **Catalog + `file_id`:** complete [telegram-file-id.md](./telegram-file-id.md) (Path A or B).
2. **Large files (100 MB+ rows in the table below):** complete [telegram-local-bot-api.md](./telegram-local-bot-api.md) first; health must show `local_bot_api`.
3. **Env:** `TELEGRAM_BOT_TOKEN` in `apps/api/.env`; API running (`pnpm run start:api:dev`).
4. **Web:** `pnpm run start:web`; mock auth if testing outside Telegram (`README.md`).
5. **POC page:** open `http://localhost:5173/poc`, paste **episode UUID**, run **Resolve /play**.
6. **Real device:** open the Mini App inside Telegram and repeat on Wi‑Fi and mobile data.
7. **Fill in** the measurement table below after each file size.

## Setup

1. Configure `TELEGRAM_BOT_TOKEN`. For files **over 20 MB**, run Local Bot API and set `TELEGRAM_API_BASE_URL` / `TELEGRAM_FILE_BASE_URL` ([telegram-local-bot-api.md](./telegram-local-bot-api.md)). Upload test MP4 files (100 MB, 300 MB, 500 MB) to the private storage channel.
2. Seed or insert an `episodes` row with each `telegram_file_id`.
3. Open the web app at `/poc`, paste the episode UUID, call **Resolve /play**.
4. Test inside Telegram (iOS, Android, Desktop) on Wi‑Fi and mobile data.

## Record (fill in after manual runs)

| File size | getFile OK | HTML5 play | Seek | Resume | Initial load | Notes |
|-----------|------------|------------|------|--------|--------------|-------|
| 100 MB    |            |            |      |        |              |       |
| 300 MB    |            |            |      |        |              |       |
| 500 MB    |            |            |      |        |              |       |

## Bot API limits

- Cloud Bot API `getFile` limit is **20 MB**. This repo supports large files via **Local Bot API** env config ([telegram-local-bot-api.md](./telegram-local-bot-api.md)); otherwise use S3/R2/Bunny through a future `VideoProvider`.
- Resolved `/file/bot<token>/...` URLs are **short-lived**; clients must refresh via `GET /api/v1/episodes/:id/play` (implemented).

## Conclusion (go / no-go)

- **Status:** Pending manual measurement with real bot + channel assets.
- **Architecture:** If Telegram is unreliable, keep catalog/auth/history and swap only `TelegramVideoProvider`.

## Why not Vercel for video bytes

Movie files must not stream through Vercel serverless functions (timeout, bandwidth, cost). Playback URLs should point directly at Telegram (MVP) or CDN origin later.
