import { AdminEpisodeDto, AdminMovieDto } from '@movie/types';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { MovieEntity } from '../movies/entities/movie.entity';

export function toAdminMovieDto(movie: MovieEntity, episodeCount?: number): AdminMovieDto {
  return {
    id: movie.id,
    title: movie.title,
    titleKh: movie.titleKh,
    slug: movie.slug,
    description: movie.description,
    descriptionKh: movie.descriptionKh,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    releaseYear: movie.releaseYear,
    durationMinutes: movie.durationMinutes,
    rating: movie.rating,
    country: movie.country,
    originalLanguage: movie.originalLanguage,
    type: movie.type,
    status: movie.status,
    isFeatured: movie.isFeatured,
    isTrending: movie.isTrending,
    publishedAt: movie.publishedAt?.toISOString() ?? null,
    categoryIds: (movie.categories ?? []).map((c) => c.id),
    episodeCount,
    createdAt: movie.createdAt.toISOString(),
    updatedAt: movie.updatedAt.toISOString(),
  };
}

export function toAdminEpisodeDto(episode: EpisodeEntity, movieTitle?: string): AdminEpisodeDto {
  return {
    id: episode.id,
    movieId: episode.movieId,
    movieTitle,
    seasonId: episode.seasonId,
    episodeNumber: episode.episodeNumber,
    title: episode.title,
    titleKh: episode.titleKh,
    thumbnailUrl: episode.thumbnailUrl,
    durationSeconds: episode.durationSeconds,
    telegramFileId: episode.telegramFileId,
    telegramFileUniqueId: episode.telegramFileUniqueId,
    mimeType: episode.mimeType,
    status: episode.status,
    createdAt: episode.createdAt.toISOString(),
    updatedAt: episode.updatedAt.toISOString(),
  };
}
