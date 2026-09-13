# Getting a Telegram `file_id` for episodes

This app stores videos as Telegram files, not on your API server. Each playable row in `episodes` needs a valid **`telegram_file_id`**. The Nest API resolves playback with Bot API [`getFile`](https://core.telegram.org/bots/api#getfile) (see `TelegramFileService`).

There is **no bot webhook or admin UI** in this repo yet—you capture the `file_id` once (manually or via `getUpdates`), then save it in PostgreSQL.

Related: [telegram-video-poc.md](./telegram-video-poc.md) (playback testing), [architecture.md](./architecture.md) (video provider boundary).

---

## What you are collecting

| Field | Purpose |
|--------|---------|
| **`telegram_file_id`** | Required. Opaque id Telegram assigns for that video **for your bot**. Stored on `episodes.telegram_file_id`. |
| **`telegram_file_unique_id`** | Optional. More stable across bots; useful for your notes (`episodes.telegram_file_unique_id`). |
| **`TELEGRAM_STORAGE_CHAT_ID`** | Optional in `apps/api/.env`. Channel id (often `-100…`) for documentation; not used by upload automation in MVP. |
| **`telegram_chat_id` / `telegram_message_id`** | Optional columns on `episodes` for your own traceability. |

Playback path: `episodes.telegram_file_id` → `getFile` → short-lived `https://api.telegram.org/file/bot<token>/…` URL → client refreshes via `GET /api/v1/episodes/:id/play`.

---

## A. One-time Telegram setup

### 1. Create the bot and token

1. Open [@BotFather](https://t.me/BotFather).
2. Send `/newbot`, follow prompts, copy the **HTTP API token**.
3. Set in `apps/api/.env`:

   ```env
   TELEGRAM_BOT_TOKEN=123456789:AAH...
   TELEGRAM_BOT_USERNAME=your_bot_username
   ```

4. Restart the API if it is already running.

### 2. Create a private storage channel

1. **New Channel** (e.g. `Movie Storage Dev`).
2. Set visibility to **Private** (invite-only).
3. Only trusted admins and the bot should access full-length files here.

### 3. Add the bot as channel administrator

1. Channel → **Manage** → **Administrators** → **Add administrator**.
2. Select `@your_bot_username`.
3. Grant at least what you need for your workflow (often **Post messages**). You (human) can upload MP4s as channel owner; the bot does not have to be the uploader.

The bot must be able to resolve the file with **the same token** you put in `TELEGRAM_BOT_TOKEN`.

### 4. (Optional) Record the channel chat id

1. Forward any message from the channel to [@userinfobot](https://t.me/userinfobot) or [@getidsbot](https://t.me/getidsbot).
2. Copy the channel **chat id** (typically `-100…`).
3. Add to `apps/api/.env`:

   ```env
   TELEGRAM_STORAGE_CHAT_ID=-1001234567890
   ```

---

## B. Upload the video

1. Open the private channel (mobile or desktop).
2. Send the file as **video** when possible (prefer **MP4** for HTML5 players). The API defaults missing mime to `video/mp4`.
3. Wait for Telegram to finish processing (large uploads take time).

### 20 MB limit

Standard Bot API **`getFile` supports files up to 20 MB**. Larger assets require a [Local Bot API Server](https://core.telegram.org/bots/api#using-a-local-bot-api-server) or a non-Telegram `VideoProvider` later. For first tests, use a **small MP4 under 20 MB**.

---

## C. Capture the `file_id`

### Method 1 — Forward channel post to your bot (recommended)

1. Open a **private chat** with your bot; send `/start`.
2. In the **channel**, open the video message → **Forward** → choose your bot.
3. Fetch updates (replace `YOUR_TOKEN`):

   **PowerShell / curl:**

   ```bash
   curl "https://api.telegram.org/botYOUR_TOKEN/getUpdates"
   ```

4. In the JSON, find the latest `message` with a `video` object:

   ```json
   "video": {
     "file_id": "BAACAgIAAxkBAAI...",
     "file_unique_id": "AgAD...",
     "duration": 120,
     "file_name": "movie.mp4",
     "mime_type": "video/mp4",
     "file_size": 15728640
   }
   ```

5. Copy **`file_id`** for the database step below.

**Empty `result`?** Forward the video again, then call `getUpdates` immediately.

**Large update queue (dev only):** acknowledge pending updates, then forward again:

```bash
curl "https://api.telegram.org/botYOUR_TOKEN/getUpdates?offset=-1"
```

Never commit or share your bot token.

### Method 2 — Upload directly to the bot

1. Private chat with the bot → attach the video.
2. `getUpdates` → read `message.video.file_id`.

Good for a quick playback test. For production-style storage, keep the canonical copy in the **private channel** and use Method 1 so your workflow matches the README channel model.

### Method 3 — Third-party debug bots

Forward the channel message to bots such as [@RawDataBot](https://t.me/RawDataBot) and read `file_id` from the payload.

Use only for **non-sensitive test clips**; third-party bots receive message metadata (and may see media).

---

## D. Verify before updating the database

```bash
curl "https://api.telegram.org/botYOUR_TOKEN/getFile?file_id=YOUR_FILE_ID"
```

Expect:

```json
{
  "ok": true,
  "result": {
    "file_path": "videos/file_....mp4",
    "file_size": 15728640
  }
}
```

If `ok` is false or `file_path` is missing, the app will fail playback with `TELEGRAM_FILE_NOT_FOUND`.

Optional: open `https://api.telegram.org/file/bot<TOKEN>/<file_path>` in a browser to confirm download/play. That URL is **short-lived**; the app re-resolves via `/episodes/:id/play`.

---

## E. Save on the `episodes` row

After `pnpm run seed:dev` or your own inserts:

```sql
UPDATE episodes
SET
  telegram_file_id = 'BAACAgIAAxkBAAI...',
  telegram_file_unique_id = 'AgAD...',
  mime_type = 'video/mp4',
  file_size_bytes = 15728640,
  duration_seconds = 7200,
  status = 'ACTIVE',
  updated_at = now()
WHERE movie_id = (SELECT id FROM movies WHERE slug = 'sample-movie')
  AND episode_number = 1;
```

Use the **same bot** as `TELEGRAM_BOT_TOKEN` when obtaining the `file_id`.

---

## F. Verify in this project

1. API running with valid `TELEGRAM_BOT_TOKEN`.
2. Episode UUID:

   ```sql
   SELECT id FROM episodes
   WHERE movie_id = (SELECT id FROM movies WHERE slug = 'sample-movie');
   ```

3. Web POC: `http://localhost:5173/poc` → paste episode id → **Resolve /play** (Telegram auth or local mock per root `README.md`).
4. Or Swagger: `GET /api/v1/episodes/:id/play` with `Authorization: tma …`.

---

## Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| `getFile` fails | Wrong token, wrong `file_id`, or id from a different bot |
| Works in curl, fails in app | API not restarted after `.env` change; different `DATABASE_URL` |
| File &gt; 20 MB | Standard Bot API limit; shrink test file or use Local Bot API |
| Empty `getUpdates` | No forward to bot yet; `/start` then forward again |
| Play URL stops after ~1 hour | Expected; client must call `/play` again (`expiresAt` ~ 1h) |

---

## Checklist

- [ ] `TELEGRAM_BOT_TOKEN` (and optionally `TELEGRAM_BOT_USERNAME`, `TELEGRAM_STORAGE_CHAT_ID`) in `apps/api/.env`
- [ ] Private channel created; bot is administrator
- [ ] Test MP4 uploaded (≤ 20 MB for standard Bot API)
- [ ] Video forwarded to bot; `file_id` copied from `getUpdates`
- [ ] `getFile` returns `file_path`
- [ ] `episodes.telegram_file_id` updated; `status = 'ACTIVE'`
- [ ] `/poc` or `/episodes/:id/play` succeeds

---

## Adding catalog metadata (movies)

This document covers **video identity** only. To add or change titles, posters, and slugs, insert/update `movies` and link `episodes` (no REST admin yet). Example after migrations:

```sql
INSERT INTO movies (title, slug, type, status, poster_url)
VALUES ('My Film', 'my-film', 'MOVIE', 'ACTIVE', 'https://example.com/poster.jpg')
RETURNING id;
```

Then insert an episode with the `file_id` from the steps above. See `apps/api/src/database/seeds/seed-dev.ts` for a minimal example.
