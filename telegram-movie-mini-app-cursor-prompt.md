# Cursor Build Prompt — Telegram Movie Mini App

You are a senior full-stack architect and developer. Build a production-ready Telegram Movie Mini App progressively, following every requirement in this document.

## 1. Project goal

Build a mobile-first movie streaming Mini App that runs inside Telegram.

The system uses:

- A private Telegram channel for storing video files
- Telegram Bot API for resolving stored video references
- Neon PostgreSQL for all application data
- NestJS, TypeScript, TypeORM, and PostgreSQL for the backend
- React, Vite, TypeScript, Ant Design, and Tailwind CSS for the frontend
- TanStack Query for server state
- Zustand for small client-side state
- Axios for API requests
- React Router DOM for routing
- Vercel for frontend hosting

Do not use Google Sheets anywhere in this project.

The MVP must be clean, secure, modular, and ready to migrate later from Telegram video delivery to an object-storage/CDN provider.

## 2. Critical rules

1. Store Telegram file references in PostgreSQL, never temporary Telegram download URLs.
2. Never expose the Telegram bot token, database URL, or any backend secret to the frontend.
3. Verify Telegram Mini App `initData` on the backend. Never trust a client-supplied Telegram user ID by itself.
4. Keep controllers independent of TypeORM and Telegram-specific playback details.
5. Put media delivery behind a `VideoProvider` abstraction.
6. Run the Telegram video proof of concept before building the full UI.
7. Do not proxy full movie bytes through Vercel functions.
8. Do not generate the entire application in one uncontrolled step. Work phase by phase and verify each phase.

## 3. Target architecture

```text
Telegram Mini App
    │
    ▼
React + Vite + TypeScript
    │
    ▼
NestJS REST API
    ├── Neon PostgreSQL
    │   ├── users
    │   ├── movies
    │   ├── seasons
    │   ├── episodes
    │   ├── categories and genres
    │   ├── favorites
    │   └── watch history
    │
    └── VideoProvider
        └── Telegram Bot API
            └── Private Telegram Channel
```

Deployment:

```text
Frontend: Vercel
Backend: Node-compatible host; use Vercel only if runtime constraints are acceptable
Database: Neon PostgreSQL
Video storage for MVP: Private Telegram channel
```

## 4. Monorepo structure

Use pnpm workspaces:

```text
telegram-movie-app/
├── apps/
│   ├── api/
│   │   └── NestJS backend
│   └── web/
│       └── React Telegram Mini App
├── packages/
│   ├── types/
│   ├── shared/
│   └── api-client/
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

Use strict TypeScript, clean imports, ESLint, Prettier, and consistent path aliases such as `@api/*`, `@web/*`, and `@shared/*`.

## 5. Backend stack

Use:

- NestJS
- TypeScript
- TypeORM
- PostgreSQL hosted by Neon
- `pg`
- NestJS `ConfigModule`
- Axios or NestJS `HttpModule`
- `class-validator`
- `class-transformer`
- Swagger/OpenAPI
- Helmet
- Rate limiting
- Jest

Suggested structure:

```text
apps/api/src/
├── main.ts
├── app.module.ts
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── interfaces/
│   ├── constants/
│   └── utils/
└── modules/
    ├── auth/
    ├── users/
    ├── telegram/
    ├── movies/
    ├── seasons/
    ├── episodes/
    ├── categories/
    ├── genres/
    ├── banners/
    ├── favorites/
    ├── watch-history/
    ├── playback/
    └── health/
```

Use migrations in deployed environments. Do not use `synchronize: true` in production.

## 6. Environment configuration

Backend `.env.example`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api

DATABASE_URL=postgresql://user:password@host/database?sslmode=require

TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
TELEGRAM_STORAGE_CHAT_ID=
TELEGRAM_AUTH_MAX_AGE_SECONDS=86400

CACHE_ENABLED=true
CACHE_DEFAULT_TTL_SECONDS=300

CORS_ORIGINS=http://localhost:5173
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX=100
```

Frontend `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_TELEGRAM_BOT_USERNAME=
VITE_ENABLE_TELEGRAM_MOCK=true
```

Validate all backend environment variables at startup. Never commit real secrets.

## 7. Database design

Use UUID primary keys, `timestamptz` audit columns, indexes for common filters, foreign keys, explicit unique constraints, and enums or constrained strings for stable statuses.

### users

```text
id uuid PK
telegramUserId bigint UNIQUE NOT NULL
username varchar nullable
firstName varchar nullable
lastName varchar nullable
languageCode varchar nullable
photoUrl text nullable
status enum(ACTIVE, BLOCKED) default ACTIVE
lastSeenAt timestamptz nullable
createdAt timestamptz
updatedAt timestamptz
```

Keep Telegram IDs as `bigint` in PostgreSQL and strings in JavaScript domain objects when needed to avoid numeric precision issues.

### movies

```text
id uuid PK
title varchar NOT NULL
titleKh varchar nullable
slug varchar UNIQUE NOT NULL
description text nullable
descriptionKh text nullable
posterUrl text nullable
backdropUrl text nullable
releaseYear int nullable
durationMinutes int nullable
rating numeric(3,1) nullable
country varchar nullable
originalLanguage varchar nullable
type enum(MOVIE, SERIES) NOT NULL
status enum(DRAFT, ACTIVE, INACTIVE, COMING_SOON) NOT NULL
isFeatured boolean default false
isTrending boolean default false
publishedAt timestamptz nullable
createdAt timestamptz
updatedAt timestamptz
```

### seasons

```text
id uuid PK
movieId uuid FK movies.id
seasonNumber int NOT NULL
title varchar nullable
titleKh varchar nullable
description text nullable
posterUrl text nullable
status enum(ACTIVE, INACTIVE) NOT NULL
createdAt timestamptz
updatedAt timestamptz
UNIQUE(movieId, seasonNumber)
```

### episodes

```text
id uuid PK
movieId uuid FK movies.id
seasonId uuid nullable FK seasons.id
episodeNumber int NOT NULL
title varchar nullable
titleKh varchar nullable
description text nullable
descriptionKh text nullable
thumbnailUrl text nullable
durationSeconds int nullable
telegramFileId text NOT NULL
telegramFileUniqueId text nullable
telegramMessageId bigint nullable
telegramChatId bigint nullable
mimeType varchar nullable
fileSizeBytes bigint nullable
status enum(DRAFT, ACTIVE, INACTIVE) NOT NULL
createdAt timestamptz
updatedAt timestamptz
```

Add uniqueness appropriate to standalone movies and series episodes. Model it carefully so movies can have one playable item while series can contain seasons and multiple episodes.

### categories and genres

Create:

```text
categories
genres
movie_categories
movie_genres
```

Both category and genre records contain `id`, English and Khmer names, unique `slug`, optional image, sort order, status, and timestamps. Join tables use composite unique constraints.

### banners

```text
id uuid PK
movieId uuid nullable FK movies.id
title varchar nullable
titleKh varchar nullable
imageUrl text NOT NULL
targetUrl text nullable
sortOrder int default 0
status enum(ACTIVE, INACTIVE)
startAt timestamptz nullable
endAt timestamptz nullable
createdAt timestamptz
updatedAt timestamptz
```

### favorites

```text
id uuid PK
userId uuid FK users.id
movieId uuid FK movies.id
createdAt timestamptz
UNIQUE(userId, movieId)
```

### watch_history

```text
id uuid PK
userId uuid FK users.id
movieId uuid FK movies.id
episodeId uuid FK episodes.id
positionSeconds int default 0
durationSeconds int nullable
progressPercent numeric(5,2) default 0
completed boolean default false
lastWatchedAt timestamptz
createdAt timestamptz
updatedAt timestamptz
UNIQUE(userId, episodeId)
```

Create TypeORM entities, migrations, repositories, indexes, relations, and a development seed script with sample movies, categories, seasons, and episodes.

## 8. Repository and domain boundaries

Keep persistence behind repository contracts where it improves replaceability and testability.

```ts
export interface MovieRepository {
  findMany(query: MovieQuery): Promise<PaginatedResult<Movie>>;
  findById(id: string): Promise<Movie | null>;
  findBySlug(slug: string): Promise<Movie | null>;
  findFeatured(limit: number): Promise<Movie[]>;
  findTrending(limit: number): Promise<Movie[]>;
}
```

Controllers must call application services, not TypeORM repositories directly. Avoid leaking TypeORM entities into shared frontend contracts.

## 9. Telegram Mini App authentication

The frontend sends raw `Telegram.WebApp.initData` using one consistent header:

```http
Authorization: tma <initData>
```

Create:

```text
TelegramAuthService
TelegramAuthGuard
CurrentTelegramUser decorator
TelegramInitData interface
```

Backend validation must:

1. Parse query-string fields safely.
2. Remove `hash` before building the data-check string.
3. Sort remaining keys lexicographically.
4. Build `key=value` lines joined by newline.
5. Derive the Telegram Web App secret key according to the official algorithm.
6. Compute and compare the HMAC using a timing-safe comparison.
7. Validate `auth_date` against `TELEGRAM_AUTH_MAX_AGE_SECONDS`.
8. Parse the user payload safely.
9. Upsert or update the local user and `lastSeenAt`.

Never log full `initData`, its hash, or the bot token.

Create:

```http
GET /api/v1/auth/me
```

Return the verified application user.

Support mock Telegram context only in local development. Production protected endpoints must reject missing or invalid `initData`.

## 10. Telegram module

```text
modules/telegram/
├── telegram.module.ts
├── telegram.service.ts
├── telegram-file.service.ts
├── telegram.types.ts
└── telegram.constants.ts
```

Responsibilities:

- Call Telegram Bot API safely with timeouts.
- Resolve `file_id` using `getFile`.
- Normalize Telegram API failures.
- Return current file metadata to the playback provider.
- Mask secrets and sensitive request values in logs.
- Retry only safe transient errors with bounded backoff.

Persist this reference, not a resolved URL:

```ts
export interface TelegramVideoReference {
  telegramFileId: string;
  telegramFileUniqueId?: string;
  telegramMessageId?: string;
  telegramChatId?: string;
}
```

## 11. Playback abstraction

Create provider-neutral contracts:

```ts
export interface PlaybackSource {
  episodeId: string;
  url: string;
  mimeType?: string;
  expiresAt?: string;
  provider: 'telegram' | 's3' | 'r2' | 'bunny';
}

export interface VideoProvider {
  resolvePlaybackSource(episode: Episode): Promise<PlaybackSource>;
}
```

Implement `TelegramVideoProvider` first. Keep the design ready for `S3VideoProvider`, `CloudflareR2VideoProvider`, or `BunnyVideoProvider` later.

Do not store resolved Telegram URLs in PostgreSQL. Resolve the current source on demand. If the source expires, the frontend requests `/play` again and retries playback once.

Before returning a playback source, verify that the episode and movie are active and the current user is allowed to watch them.

## 12. Telegram video proof of concept

Before implementing the full product, create `docs/telegram-video-poc.md` and a minimal playable test page.

Test video sizes:

- 100 MB
- 300 MB
- 500 MB

Test environments:

- Telegram on iOS
- Telegram on Android
- Telegram Desktop
- Wi-Fi
- Mobile data
- At least five simultaneous users

Verify and document:

- Whether official Bot API file-size limits block the chosen files
- Whether a Local Bot API Server is required
- HTML5 video playback
- Range request support
- Seeking forward and backward
- Resume playback
- Initial load time and buffering
- URL lifetime and refresh behavior
- Concurrent playback behavior
- Whether Telegram is reliable enough as a production video origin
- Why Vercel must not proxy movie bytes

Treat Telegram video delivery as a technical risk. If it is unreliable, retain the rest of the application and replace only the `VideoProvider` implementation.

## 13. REST API

Use URI versioning and the `/api/v1` prefix.

```http
GET    /api/v1/health
GET    /api/v1/auth/me

GET    /api/v1/movies
GET    /api/v1/movies/featured
GET    /api/v1/movies/trending
GET    /api/v1/movies/slug/:slug
GET    /api/v1/movies/:id
GET    /api/v1/movies/:id/seasons
GET    /api/v1/movies/:id/episodes

GET    /api/v1/seasons/:id/episodes
GET    /api/v1/episodes/:id
GET    /api/v1/episodes/:id/play

GET    /api/v1/categories
GET    /api/v1/categories/:slug/movies
GET    /api/v1/genres
GET    /api/v1/genres/:slug/movies
GET    /api/v1/banners

GET    /api/v1/favorites
POST   /api/v1/favorites/:movieId
DELETE /api/v1/favorites/:movieId

GET    /api/v1/watch-history
PUT    /api/v1/watch-history/:episodeId
DELETE /api/v1/watch-history/:episodeId
```

Movie listing supports validated query parameters:

```text
page
limit
search
category
genre
country
releaseYear
type
sort
```

Example:

```http
GET /api/v1/movies?page=1&limit=20&search=king&category=action
```

Use consistent responses:

```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

Do not expose stack traces or raw upstream errors.

## 14. Backend validation, errors, and security

Implement:

- Global `ValidationPipe` with transform, whitelist, and forbid-non-whitelisted behavior
- Global exception filter
- Response interceptor
- Helmet
- Explicit CORS allowlist
- Rate limiting, especially for auth and playback endpoints
- DTO length and range validation
- UUID validation
- Safe pagination limits
- Parameterized TypeORM queries
- Environment validation
- Request correlation IDs
- Graceful shutdown

Standard error shape:

```json
{
  "success": false,
  "message": "Episode not found",
  "code": "EPISODE_NOT_FOUND"
}
```

Include error codes:

```text
MOVIE_NOT_FOUND
SEASON_NOT_FOUND
EPISODE_NOT_FOUND
INVALID_TELEGRAM_AUTH
TELEGRAM_AUTH_EXPIRED
PLAYBACK_SOURCE_FAILED
TELEGRAM_FILE_NOT_FOUND
RATE_LIMIT_EXCEEDED
DATABASE_UNAVAILABLE
```

## 15. Cache layer

Create a replaceable cache contract:

```ts
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

For local MVP, implement an in-memory `Map` cache with expiry and cleanup. Suggested TTLs:

```text
featured movies: 5 minutes
trending movies: 5 minutes
movie detail: 5 minutes
categories: 10 minutes
genres: 10 minutes
banners: 10 minutes
```

Do not cache user-specific favorites or watch history globally. Keep the contract ready for Redis or Valkey.

## 16. Health and logging

Create:

```http
GET /api/v1/health
```

Return a safe status for API, Neon PostgreSQL, Telegram integration, and cache without exposing credentials or internal connection details.

Use structured, concise logs such as:

```text
MOVIE CACHE HIT
MOVIE CACHE MISS
TELEGRAM FILE RESOLVE
PLAYBACK SOURCE GENERATED
TELEGRAM AUTH FAILED
DATABASE QUERY FAILED
```

Never log bot tokens, `DATABASE_URL`, full Telegram `initData`, authorization headers, or resolved private URLs.

## 17. Frontend stack and responsibilities

Use exactly:

- React
- Vite
- TypeScript
- Ant Design
- Tailwind CSS
- TanStack Query
- Zustand
- Axios
- React Router DOM
- `react-i18next`
- Telegram Mini Apps JavaScript SDK
- Vitest and React Testing Library

Use Ant Design for functional primitives such as `Drawer`, `Modal`, `Skeleton`, `Empty`, `Form`, and notifications. Use Tailwind for layout, spacing, responsive behavior, and the custom streaming visual design. Keep Ant Design theme tokens centralized and avoid conflicting styling responsibilities.

## 18. Frontend structure

```text
apps/web/src/
├── main.tsx
├── App.tsx
├── api/
│   ├── client.ts
│   ├── query-client.ts
│   └── query-keys.ts
├── assets/
├── components/
├── config/
├── constants/
├── hooks/
├── layouts/
├── locales/
│   ├── en.json
│   └── km.json
├── pages/
├── routes/
├── store/
├── styles/
├── types/
├── utils/
└── features/
    ├── auth/
    ├── home/
    ├── movies/
    ├── categories/
    ├── search/
    ├── player/
    ├── favorites/
    └── history/
```

Prefer feature folders for feature-specific components, API calls, hooks, types, and tests. Keep genuinely shared UI in `components`.

## 19. Frontend routes

```text
/                    Home
/search              Search
/categories          Categories
/category/:slug      Category movies
/movie/:slug         Movie detail
/watch/:episodeId    Video player
/favorites           Favorites
/history             Watch history
```

Create route-level lazy loading and useful error boundaries.

## 20. Telegram frontend integration

Create a reusable `useTelegram()` hook that exposes:

```ts
{
  webApp,
  user,
  initData,
  colorScheme,
  isTelegram,
  isReady
}
```

Support:

- `ready()`
- `expand()`
- viewport information
- Telegram theme parameters
- BackButton integration with React Router
- safe-area insets
- MainButton only where it improves the flow
- light and dark Telegram color schemes

The application must run outside Telegram during local development with explicit mock data. Production must not accept mock authentication.

## 21. Axios and TanStack Query

Create one centralized Axios client that attaches:

```http
Authorization: tma <initData>
```

Handle `401`, `403`, `404`, `429`, and `500` consistently without exposing technical errors to users.

Create centralized query keys and hooks:

```text
useCurrentUser
useMovies
useFeaturedMovies
useTrendingMovies
useMovie
useSeasons
useEpisodes
useCategories
useGenres
useBanners
usePlaybackSource
useFavorites
useWatchHistory
```

Use sensible `staleTime`, retries, `enabled` conditions, query cancellation, optimistic favorite updates, and targeted cache invalidation. Do not store server data redundantly in Zustand.

Use Zustand only for appropriate local state such as language, player preferences, and development-only Telegram mock state.

## 22. UI and pages

The design must be dark-first, mobile-first, modern, and suitable for a streaming application—not an admin dashboard.

Design principles:

- Large visual posters and backdrops
- Clear typography for English and Khmer
- Rounded cards
- Comfortable spacing
- Skeleton loading
- Useful empty and error states
- Minimal, smooth motion
- Touch-friendly controls
- Safe-area support inside Telegram
- Responsive behavior from 320 px through desktop

Home includes:

- Search entry
- Featured banner carousel
- Continue Watching when data exists
- Trending
- Latest Movies
- Categories
- Optional recommendations later

Movie cards show poster, localized title, year, rating, and optional media type.

Movie detail includes backdrop, poster, localized title and description, rating, release year, country, language, genres, Watch Now button, seasons, and episodes.

Search uses debouncing, query-string state, loading skeletons, empty state, and pagination or infinite loading.

Favorites and history are backed by the API, not only browser local storage.

## 23. Video player

Start with native HTML5 video and create:

```text
VideoPlayer
PlayerControls
PlayerLoading
PlayerError
```

Support:

- Play and pause
- Seek
- Volume and mute
- Current time and duration
- Loading state
- Retry
- Full screen when supported
- Persisted watch progress
- Resume playback
- Mark complete near the end

Throttle watch-progress updates instead of sending on every time event. Send a final update on pause, route change, and completion when possible.

When a playback source is expired or unauthorized, request a fresh source and retry once. Avoid infinite retry loops.

## 24. Internationalization

Use `react-i18next` with:

```text
locales/en.json
locales/km.json
```

Use Telegram `language_code` as the initial preference when supported, then remember the user's explicit selection. Support English and Khmer movie fields such as `title`, `titleKh`, `description`, and `descriptionKh` with a sensible fallback.

Use fonts that render both scripts well and verify common UI layouts in Khmer.

## 25. Swagger and API contracts

Add Swagger documentation for public and authenticated endpoints, DTOs, pagination, error codes, and the `Authorization: tma ...` scheme.

Share only transport-safe types through `packages/types`. Do not share TypeORM entities with the frontend.

If generating an API client from OpenAPI, keep generation reproducible and documented.

## 26. Testing

Backend tests must include:

- Telegram initData signature validation
- Expired auth rejection
- Tampered auth rejection
- Movie filters and pagination
- TypeORM repository mapping
- Cache expiration
- Playback provider success and failures
- Inactive episode protection
- Favorites idempotency
- Watch-history upsert

Frontend tests must include:

- Telegram and browser-development initialization
- Axios auth header attachment
- Movie list states
- Movie detail and episode selection
- Favorite mutation
- Player source refresh after expiry
- Watch-progress throttling logic

Add a few meaningful end-to-end tests for authentication, browsing a movie, resolving playback, favorites, and history. Mock Telegram upstream calls in automated tests.

## 27. Deployment

Frontend deploys to Vercel.

Backend may deploy to Vercel only if NestJS cold starts, function duration, networking, playback-source resolution, and Neon connection behavior are acceptable. Otherwise prepare deployment for Railway, Render, Fly.io, or a VPS.

For Neon:

- Use SSL.
- Choose pooling suitable for the hosting runtime.
- Keep connection limits under control.
- Use migrations during deployment.
- Do not create a new database connection per request.

Do not proxy movie bytes through Vercel. The playback response should point to the current media source when technically and legally appropriate.

## 28. README and documentation

Create a professional `README.md` containing:

- Project overview
- Architecture
- Tech stack
- Folder structure
- Prerequisites
- pnpm workspace commands
- Environment variables
- Neon project setup
- Migration and seed commands
- Telegram bot setup
- Private channel setup
- How to add the bot as channel admin
- Telegram Mini App setup through BotFather
- Local browser development and Telegram testing
- API documentation
- Test commands
- Deployment guidance
- Known Telegram video limitations
- Migration path to S3, R2, Bunny, or another CDN

Also create focused documents in `docs/` for architecture decisions, Telegram authentication, the video POC, database schema, and deployment.

## 29. Future-ready boundaries

Do not implement all future features now, but keep the architecture open for:

- Admin portal
- Automated Telegram uploads
- Multiple video providers
- Subscription and entitlement checks
- Notifications
- Analytics
- Recommendations
- Redis or Valkey
- Object storage/CDN
- Content moderation
- Multiple audio tracks and subtitles

Avoid speculative abstractions that the MVP does not need. Add clear interfaces only at real boundaries: repositories, cache, authentication context, and video providers.

## 30. Progressive implementation plan

Work in this exact order.

### Phase 0 — Repository and Telegram video POC

- Initialize the pnpm monorepo.
- Create minimal API and web applications.
- Configure linting, formatting, strict TypeScript, and environment validation.
- Build the Telegram video POC.
- Produce `docs/telegram-video-poc.md` with measured results and a go/no-go conclusion.
- Stop and report findings before building the complete UI.

### Phase 1 — Backend foundation

- Configure NestJS, Neon, TypeORM, migrations, health checks, Swagger, validation, errors, and logging.
- Create the initial schema and seed data.
- Add unit tests.

### Phase 2 — Authentication and catalog

- Implement verified Telegram Mini App authentication.
- Implement users, movies, seasons, episodes, categories, genres, and banners.
- Add filtering, search, pagination, and tests.

### Phase 3 — Playback

- Implement `VideoProvider` contracts and `TelegramVideoProvider`.
- Implement the protected playback endpoint.
- Test expiration, upstream failures, and inactive content.

### Phase 4 — Frontend foundation and browsing

- Configure React, Vite, Ant Design, Tailwind, routing, i18n, Axios, TanStack Query, Zustand, and Telegram integration.
- Build Home, Search, Categories, and Movie Detail.
- Add loading, empty, error, and offline-aware states.

### Phase 5 — Player and user data

- Build the video player and source refresh.
- Implement favorites, watch history, resume, and continue watching.
- Add targeted frontend and backend tests.

### Phase 6 — Quality and deployment

- Run linting, type checking, tests, migrations, builds, and security review.
- Finish documentation.
- Prepare Vercel frontend deployment and the selected backend deployment.
- Verify the complete flow inside Telegram on iOS and Android.

## 31. Required workflow for every phase

For each phase:

1. Explain the goal and design decisions briefly.
2. List the files you will create or modify.
3. Implement only that phase.
4. Run relevant lint, type-check, test, migration, and build commands.
5. Fix failures caused by your changes.
6. Summarize completed work, commands run, and remaining risks.
7. Stop and wait for approval before beginning the next phase.

Do not leave placeholder code presented as complete. If credentials or live Telegram assets are unavailable, implement the testable boundary, use explicit mocks only in development/tests, document the manual verification step, and continue with all work that does not require secrets.

## 32. Code quality expectations

- Use clear, professional naming.
- Prefer small cohesive services and components.
- Avoid `any`; model unknown data safely.
- Avoid unnecessary comments and duplicated logic.
- Keep business rules out of controllers and React presentation components.
- Use database transactions for multi-write operations.
- Prevent N+1 queries.
- Select only required columns for listing endpoints.
- Add indexes based on actual query patterns.
- Return safe DTOs rather than entities.
- Make all date/time behavior UTC-aware.
- Keep dependency versions compatible and avoid deprecated packages.

## 33. Start instruction

Begin with Phase 0 only.

First show:

1. The proposed repository tree
2. Key architecture decisions and risks
3. The exact Telegram video POC plan
4. Commands and files required for initialization

Then implement Phase 0. Do not proceed to Phase 1 until Phase 0 is verified and I explicitly approve the next phase.
