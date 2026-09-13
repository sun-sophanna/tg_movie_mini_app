CREATE TYPE user_status AS ENUM ('ACTIVE', 'BLOCKED');
CREATE TYPE movie_type AS ENUM ('MOVIE', 'SERIES');
CREATE TYPE movie_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'COMING_SOON');
CREATE TYPE season_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE episode_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');
CREATE TYPE taxonomy_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id bigint NOT NULL UNIQUE,
  username varchar NULL,
  first_name varchar NULL,
  last_name varchar NULL,
  language_code varchar NULL,
  photo_url text NULL,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  last_seen_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  title_kh varchar NULL,
  slug varchar NOT NULL UNIQUE,
  description text NULL,
  description_kh text NULL,
  poster_url text NULL,
  backdrop_url text NULL,
  release_year int NULL,
  duration_minutes int NULL,
  rating numeric(3,1) NULL,
  country varchar NULL,
  original_language varchar NULL,
  type movie_type NOT NULL,
  status movie_status NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  is_trending boolean NOT NULL DEFAULT false,
  published_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_movies_status_created ON movies (status, created_at DESC);
CREATE INDEX idx_movies_featured ON movies (is_featured) WHERE status = 'ACTIVE';
CREATE INDEX idx_movies_trending ON movies (is_trending) WHERE status = 'ACTIVE';

CREATE TABLE seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  season_number int NOT NULL,
  title varchar NULL,
  title_kh varchar NULL,
  description text NULL,
  poster_url text NULL,
  status season_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (movie_id, season_number)
);

CREATE TABLE episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  season_id uuid NULL REFERENCES seasons(id) ON DELETE SET NULL,
  episode_number int NOT NULL,
  title varchar NULL,
  title_kh varchar NULL,
  description text NULL,
  description_kh text NULL,
  thumbnail_url text NULL,
  duration_seconds int NULL,
  telegram_file_id text NOT NULL,
  telegram_file_unique_id text NULL,
  telegram_message_id bigint NULL,
  telegram_chat_id bigint NULL,
  mime_type varchar NULL,
  file_size_bytes bigint NULL,
  status episode_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_episodes_movie ON episodes (movie_id, episode_number);
CREATE INDEX idx_episodes_season ON episodes (season_id, episode_number);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  name_kh varchar NULL,
  slug varchar NOT NULL UNIQUE,
  image_url text NULL,
  sort_order int NOT NULL DEFAULT 0,
  status taxonomy_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  name_kh varchar NULL,
  slug varchar NOT NULL UNIQUE,
  image_url text NULL,
  sort_order int NOT NULL DEFAULT 0,
  status taxonomy_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE movie_categories (
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, category_id)
);

CREATE TABLE movie_genres (
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  genre_id uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NULL REFERENCES movies(id) ON DELETE SET NULL,
  title varchar NULL,
  title_kh varchar NULL,
  image_url text NOT NULL,
  target_url text NULL,
  sort_order int NOT NULL DEFAULT 0,
  status taxonomy_status NOT NULL,
  start_at timestamptz NULL,
  end_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);

CREATE TABLE watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  episode_id uuid NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  position_seconds int NOT NULL DEFAULT 0,
  duration_seconds int NULL,
  progress_percent numeric(5,2) NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_watched_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);

CREATE INDEX idx_watch_history_user ON watch_history (user_id, last_watched_at DESC);
