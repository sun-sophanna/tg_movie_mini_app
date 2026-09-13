import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGenreDto, PaginatedResponse } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { CACHE_SERVICE, CacheService } from '../cache/cache.interface';
import { MoviesService } from '../movies/movies.service';
import { MovieQueryDto } from '../movies/dto/movie-query.dto';
import { GenreEntity } from './entities/genre.entity';
import { TaxonomyStatus } from '../categories/entities/category.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(GenreEntity)
    private readonly repo: Repository<GenreEntity>,
    @Inject(CACHE_SERVICE)
    private readonly cache: CacheService,
    private readonly movies: MoviesService,
  ) {}

  async list(): Promise<CategoryGenreDto[]> {
    const cacheKey = 'genres:all';
    const cached = await this.cache.get<CategoryGenreDto[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const rows = await this.repo.find({
      where: { status: TaxonomyStatus.ACTIVE },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    const items = rows.map((g) => ({
      id: g.id,
      name: g.name,
      nameKh: g.nameKh,
      slug: g.slug,
    }));
    await this.cache.set(cacheKey, items, 600);
    return items;
  }

  async moviesBySlug(slug: string, query: MovieQueryDto): Promise<PaginatedResponse<unknown>> {
    const genre = await this.repo.findOne({
      where: { slug, status: TaxonomyStatus.ACTIVE },
    });
    if (!genre) {
      throw new NotFoundException({
        message: 'Genre not found',
        code: ErrorCodes.MOVIE_NOT_FOUND,
      });
    }
    return this.movies.findMany({ ...query, genre: slug });
  }
}
