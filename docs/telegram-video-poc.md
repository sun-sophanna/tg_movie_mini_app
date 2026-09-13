# Telegram video POC

## Goal

Validate whether Telegram Bot API file delivery is acceptable as the MVP video origin before full production traffic.

## Setup

1. Configure `TELEGRAM_BOT_TOKEN` and upload test MP4 files (100 MB, 300 MB, 500 MB) to the private storage channel.
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

- Standard Bot API `getFile` download limit is **20 MB** per file. Larger files require a [Local Bot API Server](https://core.telegram.org/bots/api#using-a-local-bot-api-server) or a different `VideoProvider` (S3/R2/Bunny).
- Resolved `https://api.telegram.org/file/bot<token>/...` URLs are **short-lived**; clients must refresh via `GET /api/v1/episodes/:id/play` (implemented).

## Conclusion (go / no-go)

- **Status:** Pending manual measurement with real bot + channel assets.
- **Architecture:** If Telegram is unreliable, keep catalog/auth/history and swap only `TelegramVideoProvider`.

## Why not Vercel for video bytes

Movie files must not stream through Vercel serverless functions (timeout, bandwidth, cost). Playback URLs should point directly at Telegram (MVP) or CDN origin later.
