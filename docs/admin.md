# Admin dashboard

Web UI for managing movies and episodes without SQL.

## Setup

1. In `apps/api/.env`, set a strong secret:

   ```env
   ADMIN_API_KEY=your-long-random-key
   ```

2. Restart the API.

3. Open **`http://localhost:5173/admin`** (same Vite app as the Mini App viewer).

4. Sign in with the same value as `ADMIN_API_KEY`.

The key is stored in **sessionStorage** for the browser tab only.

## What you can do

| Area | Actions |
|------|---------|
| **Dashboard** | Counts of movies, episodes, categories |
| **Movies** | Search, filter, create, edit, delete |
| **Episodes** | Per movie: add/edit Telegram `file_id`, status, duration |

Set movie **Status** to **Active** and episode **Active** for playback in the app.

## Video file IDs

See [telegram-file-id.md](./telegram-file-id.md) and [telegram-local-bot-api.md](./telegram-local-bot-api.md).

## API

All routes under **`/api/v1/admin/*`** require header:

```http
X-Admin-Key: <ADMIN_API_KEY>
```

Swagger tag: **admin** (`http://localhost:3000/docs`).

## Security

- Use a long random `ADMIN_API_KEY` in production.
- Do not expose `/admin` on the public internet without HTTPS and a strong key.
- The Mini App viewer does not include admin routes in navigation; bookmark `/admin` for operators only.
