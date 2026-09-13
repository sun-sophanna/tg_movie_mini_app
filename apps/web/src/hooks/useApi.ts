import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BannerDto,
  CategoryGenreDto,
  MovieDetailDto,
  MovieListItemDto,
  PaginatedResponse,
  PlaybackSourceDto,
  UserDto,
  WatchHistoryItemDto,
} from '@movie/types';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import { queryKeys } from '../api/query-keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiGet<UserDto>('/auth/me'),
    retry: false,
  });
}

export function useMovies(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.set(k, String(v));
  });
  const qs = search.toString();
  return useQuery({
    queryKey: queryKeys.movies(params),
    queryFn: () => apiGet<PaginatedResponse<MovieListItemDto>>(`/movies?${qs}`),
  });
}

export function useFeaturedMovies() {
  return useQuery({
    queryKey: queryKeys.featured,
    queryFn: () => apiGet<MovieListItemDto[]>('/movies/featured'),
  });
}

export function useTrendingMovies() {
  return useQuery({
    queryKey: queryKeys.trending,
    queryFn: () => apiGet<MovieListItemDto[]>('/movies/trending'),
  });
}

export function useMovie(slug: string) {
  return useQuery({
    queryKey: queryKeys.movie(slug),
    queryFn: () => apiGet<MovieDetailDto>(`/movies/slug/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => apiGet<CategoryGenreDto[]>('/categories'),
  });
}

export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: () => apiGet<BannerDto[]>('/banners'),
  });
}

export function usePlaybackSource(episodeId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.playback(episodeId),
    queryFn: () => apiGet<PlaybackSourceDto>(`/episodes/${episodeId}/play`),
    enabled: Boolean(episodeId) && enabled,
    staleTime: 0,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => apiGet<MovieListItemDto[]>('/favorites'),
  });
}

export function useFavoriteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ movieId, add }: { movieId: string; add: boolean }) => {
      if (add) {
        return apiPost<{ added: boolean }>(`/favorites/${movieId}`);
      }
      return apiDelete<{ removed: boolean }>(`/favorites/${movieId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.favorites }),
  });
}

export function useWatchHistory() {
  return useQuery({
    queryKey: queryKeys.history,
    queryFn: () => apiGet<WatchHistoryItemDto[]>('/watch-history'),
  });
}

export function useUpsertWatchHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      episodeId,
      body,
    }: {
      episodeId: string;
      body: { positionSeconds: number; durationSeconds?: number; completed?: boolean };
    }) => apiPut<WatchHistoryItemDto>(`/watch-history/${episodeId}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.history }),
  });
}
