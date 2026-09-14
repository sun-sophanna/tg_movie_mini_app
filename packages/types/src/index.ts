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

export type MovieType = 'MOVIE' | 'SERIES';
export type MovieStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'COMING_SOON';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type EpisodeStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type ContentStatus = 'ACTIVE' | 'INACTIVE';

export interface UserDto {
  id: string;
  telegramUserId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  languageCode?: string | null;
  photoUrl?: string | null;
  status: UserStatus;
}

export interface MovieListItemDto {
  id: string;
  title: string;
  titleKh?: string | null;
  slug: string;
  posterUrl?: string | null;
  releaseYear?: number | null;
  rating?: string | null;
  type: MovieType;
  status: MovieStatus;
}

export interface MovieDetailDto extends MovieListItemDto {
  description?: string | null;
  descriptionKh?: string | null;
  backdropUrl?: string | null;
  durationMinutes?: number | null;
  country?: string | null;
  originalLanguage?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  genres: CategoryGenreDto[];
  categories: CategoryGenreDto[];
}

export interface CategoryGenreDto {
  id: string;
  name: string;
  nameKh?: string | null;
  slug: string;
}

export interface SeasonDto {
  id: string;
  movieId: string;
  seasonNumber: number;
  title?: string | null;
  titleKh?: string | null;
  posterUrl?: string | null;
}

export interface EpisodeDto {
  id: string;
  movieId: string;
  seasonId?: string | null;
  episodeNumber: number;
  title?: string | null;
  titleKh?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  status: EpisodeStatus;
}

export interface BannerDto {
  id: string;
  movieId?: string | null;
  title?: string | null;
  titleKh?: string | null;
  imageUrl: string;
  targetUrl?: string | null;
}

export interface PlaybackSourceDto {
  episodeId: string;
  /** URL for `<video src>` — API stream when provider is telegram (not `/play`). */
  url: string;
  mimeType?: string;
  expiresAt?: string;
  provider: 'telegram' | 's3' | 'r2' | 'bunny';
  /** `api-stream` = proxied `/episodes/:id/stream`; `direct` = CDN/Telegram file URL. */
  delivery?: 'api-stream' | 'direct';
}

export interface WatchHistoryItemDto {
  id: string;
  movieId: string;
  episodeId: string;
  positionSeconds: number;
  durationSeconds?: number | null;
  progressPercent: string;
  completed: boolean;
  lastWatchedAt: string;
  movie?: MovieListItemDto;
  episode?: EpisodeDto;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
}

export interface AdminDashboardStatsDto {
  moviesTotal: number;
  moviesActive: number;
  episodesTotal: number;
  episodesActive: number;
  categoriesTotal: number;
}

export interface AdminMovieDto {
  id: string;
  title: string;
  titleKh?: string | null;
  slug: string;
  description?: string | null;
  descriptionKh?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  releaseYear?: number | null;
  durationMinutes?: number | null;
  rating?: string | null;
  country?: string | null;
  originalLanguage?: string | null;
  type: MovieType;
  status: MovieStatus;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt?: string | null;
  categoryIds: string[];
  episodeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEpisodeDto {
  id: string;
  movieId: string;
  movieTitle?: string;
  seasonId?: string | null;
  episodeNumber: number;
  title?: string | null;
  titleKh?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  telegramFileId: string;
  telegramFileUniqueId?: string | null;
  mimeType?: string | null;
  status: EpisodeStatus;
  createdAt: string;
  updatedAt: string;
}
