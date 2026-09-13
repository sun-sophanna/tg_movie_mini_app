export const queryKeys = {
  me: ['me'] as const,
  movies: (params?: Record<string, unknown>) => ['movies', params] as const,
  featured: ['movies', 'featured'] as const,
  trending: ['movies', 'trending'] as const,
  movie: (slug: string) => ['movie', slug] as const,
  categories: ['categories'] as const,
  genres: ['genres'] as const,
  banners: ['banners'] as const,
  favorites: ['favorites'] as const,
  history: ['watch-history'] as const,
  playback: (episodeId: string) => ['playback', episodeId] as const,
};
