import { CategoryGenreDto, MovieDetailDto, MovieListItemDto } from '@movie/types';
import { CategoryEntity } from '../categories/entities/category.entity';
import { GenreEntity } from '../genres/entities/genre.entity';
import { MovieEntity } from './entities/movie.entity';

function mapTaxonomy(c: CategoryEntity | GenreEntity): CategoryGenreDto {
  return {
    id: c.id,
    name: c.name,
    nameKh: c.nameKh,
    slug: c.slug,
  };
}

export function toMovieListItem(movie: MovieEntity): MovieListItemDto {
  return {
    id: movie.id,
    title: movie.title,
    titleKh: movie.titleKh,
    slug: movie.slug,
    posterUrl: movie.posterUrl,
    releaseYear: movie.releaseYear,
    rating: movie.rating,
    type: movie.type,
    status: movie.status,
  };
}

export function toMovieDetail(movie: MovieEntity): MovieDetailDto {
  return {
    ...toMovieListItem(movie),
    description: movie.description,
    descriptionKh: movie.descriptionKh,
    backdropUrl: movie.backdropUrl,
    durationMinutes: movie.durationMinutes,
    country: movie.country,
    originalLanguage: movie.originalLanguage,
    isFeatured: movie.isFeatured,
    isTrending: movie.isTrending,
    categories: (movie.categories ?? []).map(mapTaxonomy),
    genres: (movie.genres ?? []).map(mapTaxonomy),
  };
}
