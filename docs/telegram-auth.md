# Telegram Mini App authentication

## Header

```http
Authorization: tma <url-encoded initData from Telegram.WebApp.initData>
```

## Backend steps

1. Parse query-string fields from `initData`.
2. Remove `hash`, sort keys, build `key=value` lines joined by `\n`.
3. `secret_key = HMAC_SHA256(key="WebAppData", message=bot_token)`.
4. Compare `HMAC_SHA256(key=secret_key, message=data_check_string)` to `hash` (timing-safe).
5. Enforce `auth_date` within `TELEGRAM_AUTH_MAX_AGE_SECONDS`.
6. Upsert user and update `lastSeenAt`.

Never log full `initData`, hash, or bot token.

## Local development

Frontend: `VITE_ENABLE_TELEGRAM_MOCK=true` sends `mock:` + JSON user.

Backend: `TELEGRAM_MOCK_AUTH_ENABLED=true` accepts that prefix when not in production.
