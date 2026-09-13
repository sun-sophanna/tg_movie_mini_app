# Local Bot API (files larger than 20 MB)

Telegram’s **cloud** Bot API (`https://api.telegram.org`) only allows [`getFile`](https://core.telegram.org/bots/api#getfile) / direct downloads up to **20 MB**. Full-length movies require a **[Local Bot API Server](https://core.telegram.org/bots/api#using-a-local-bot-api-server)**.

This project reads `TELEGRAM_API_BASE_URL` and `TELEGRAM_FILE_BASE_URL` in `TelegramFileService` so Nest can resolve large channel files and return playback URLs clients can open.

---

## What you need to do

Use this when videos are **over 20 MB** or you already saw a **“file is too big”** error from `getFile`.

### Development (local machine)

| Step | Action |
|------|--------|
| 1 | Create a bot via [@BotFather](https://t.me/BotFather); put `TELEGRAM_BOT_TOKEN` in `apps/api/.env`. |
| 2 | Get `api_id` and `api_hash` from [my.telegram.org](https://my.telegram.org) → API development tools. |
| 3 | Copy **`.env.example`** → **`.env`** at repo root; set `TELEGRAM_API_ID` and `TELEGRAM_API_HASH`. |
| 4 | Run **`pnpm run docker:telegram-api:up`** — Local Bot API on `http://localhost:8081`. |
| 5 | In **`apps/api/.env`**, add `TELEGRAM_API_BASE_URL=http://localhost:8081` and `TELEGRAM_FILE_REQUEST_TIMEOUT_MS=120000`. |
| 6 | **Restart** the Nest API (`pnpm run start:api:dev`). |
| 7 | Finish channel + upload steps in [telegram-file-id.md](./telegram-file-id.md), but use **`http://localhost:8081`** for all `getUpdates` / `getFile` calls (not `api.telegram.org`). |
| 8 | Save `file_id` on `episodes.telegram_file_id` in PostgreSQL; set `status = 'ACTIVE'`. |
| 9 | Confirm **`GET http://localhost:3000/api/v1/health`** → `"telegramFileDelivery": "local_bot_api"`. |
| 10 | Test playback: web **`/poc`** or **`GET /api/v1/episodes/:id/play`**. |

**Stop Local Bot API when done (optional):** `pnpm run docker:telegram-api:down`

### Production (real users on phones)

| Step | Action |
|------|--------|
| 1 | Run Local Bot API on a VPS (same Docker image as dev) with a **persistent volume**. |
| 2 | Put **HTTPS** in front (nginx, Caddy, etc.) → e.g. `https://bot-api.yourdomain.com`. |
| 3 | On the Nest host, set `TELEGRAM_API_BASE_URL` to the **internal** URL (e.g. `http://127.0.0.1:8081`) and **`TELEGRAM_FILE_BASE_URL`** to the **public HTTPS** URL users’ browsers can reach. |
| 4 | Restart Nest; health should show `local_bot_api`. |
| 5 | Re-capture or reuse `file_id` values obtained through **this** Bot API base; test on Telegram mobile, not only desktop. |

If you only need a **≤ 20 MB** test clip, you can skip this doc and use cloud `api.telegram.org` — see [telegram-file-id.md](./telegram-file-id.md).

---

## How it fits together

```text
Mini App / browser
    │  GET /api/v1/episodes/:id/play  (Nest)
    ▼
Nest → getFile on TELEGRAM_API_BASE_URL (often internal)
    ▼
Nest returns url = TELEGRAM_FILE_BASE_URL/file/bot<token>/<path>
    ▼
Player streams from Local Bot API (must be HTTPS + reachable in production)
```

- **`TELEGRAM_API_BASE_URL`** — where the **API server** calls Bot API (`getFile`). Example: `http://localhost:8081` or `http://telegram-bot-api:8081` inside Docker.
- **`TELEGRAM_FILE_BASE_URL`** — origin in **playback URLs** sent to users. Must be reachable from the user’s device (Telegram WebView). Example: `https://bot-api.yourdomain.com`. Defaults to `TELEGRAM_API_BASE_URL` if unset.

Check mode: `GET /api/v1/health` → `checks.telegramFileDelivery` is `local_bot_api` when not using cloud.

---

## 1. Get API credentials

1. Sign in at [my.telegram.org](https://my.telegram.org).
2. Open **API development tools**.
3. Create an app and copy **`api_id`** and **`api_hash`**.

These are for the Local Bot API process, not BotFather.

---

## 2. Run Local Bot API with Docker (dev)

In the repo root:

```bash
cp .env.example .env
```

Edit **`.env`** (used by Compose):

```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_api_hash_here
```

Start the server:

```bash
pnpm run docker:telegram-api:up
```

Service listens on **`http://localhost:8081`**.

Configure the Nest API in `apps/api/.env`:

```env
TELEGRAM_BOT_TOKEN=...your existing bot token...
TELEGRAM_API_BASE_URL=http://localhost:8081
# Optional if same as above:
# TELEGRAM_FILE_BASE_URL=http://localhost:8081
TELEGRAM_FILE_REQUEST_TIMEOUT_MS=120000
```

Restart the API. Upload / forward videos to your channel as in [telegram-file-id.md](./telegram-file-id.md). Use `getUpdates` against **`http://localhost:8081`** instead of `api.telegram.org` when capturing `file_id` from a bot connected through the local server.

**Note:** For local-only dev, `file_id` values are tied to the Bot API instance that issued them. Use the same base URL for `getUpdates`, `getFile`, and playback.

---

## 3. Production

1. Run Local Bot API on a VPS (Docker image `aiogram/telegram-bot-api` or official [telegram-bot-api](https://github.com/tdlib/telegram-bot-api) build) with persistent volume for cached files.
2. Put **HTTPS** reverse proxy (nginx, Caddy, etc.) in front of port `8081`.
3. Set on the Nest host:

   ```env
   TELEGRAM_API_BASE_URL=http://127.0.0.1:8081
   TELEGRAM_FILE_BASE_URL=https://bot-api.yourdomain.com
   ```

4. Ensure firewall / proxy allows **Range requests** if your player seeks (most video players do).
5. Do **not** expose the bot token in client-side code; clients only receive time-limited file paths via your authenticated `/play` endpoint (unchanged).

Local Bot API supports downloads up to **2000 MB** per file (Telegram’s documented local limit).

---

## 4. Verify

**Health**

```bash
curl http://localhost:3000/api/v1/health
```

Expect `"telegramFileDelivery": "local_bot_api"`.

**getFile** (replace token and file id):

```bash
curl "http://localhost:8081/bot<TOKEN>/getFile?file_id=<FILE_ID>"
```

**Playback**

Use `/poc` or `GET /api/v1/episodes/:id/play` as in [telegram-video-poc.md](./telegram-video-poc.md).

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Still “file is too big” | `TELEGRAM_API_BASE_URL` still points to `https://api.telegram.org`; restart API after env change |
| `/play` returns `localhost:8081/file/bot…` but video does not play | With Local Bot API, `/play` should return an **`/api/v1/episodes/…/stream?sig=…`** URL (API proxy). Restart API after setting `TELEGRAM_API_BASE_URL`. Set `TELEGRAM_PLAYBACK_PROXY=true` if needed. |
| Play works on desktop, fails on phone | `API_PUBLIC_BASE_URL` / `TELEGRAM_FILE_BASE_URL` must be a host the phone can reach (not your PC’s `localhost` unless testing on the same machine). |
| Stream 401 | `exp`/`sig` expired or wrong — call `/play` again for a fresh URL. |
| getFile OK, play 403/404 | Token mismatch, expired path, or proxy blocking `/file/bot…` |
| Slow first play | Local server may fetch from Telegram on first request; cache volume helps |

**Security:** Do not commit bot tokens (e.g. in debug JSON files). Revoke in [@BotFather](https://t.me/BotFather) if leaked.

---

## Related docs

- [telegram-file-id.md](./telegram-file-id.md) — channel uploads and `file_id`
- [telegram-video-poc.md](./telegram-video-poc.md) — POC checklist
- [architecture.md](./architecture.md) — swapping `VideoProvider` later (S3/R2/Bunny)
