import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '@movie/types';
import { MAX_LIMIT } from '@movie/shared';
import { ErrorCodes } from '../../common/constants/error-codes';
import { CACHE_SERVICE, CacheService } from '../cache/cache.interface';
import { MovieEntity, MovieStatus } from './entities/movie.entity';
import { MovieQueryDto, MovieSort } from './dto/movie-query.dto';
import { toMovieDetail, toMovieListItem } from './movie.mapper';
import { MovieDetailDto, MovieListItemDto } from '@movie/types';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly repo: Repository<MovieEntity>,
    @Inject(CACHE_SERVICE)
    private readonly cache: CacheService,
  ) {}

  async findMany(query: MovieQueryDto): Promise<PaginatedResponse<MovieListItemDto>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, MAX_LIMIT);
    const cacheKey = `movies:list:${JSON.stringify({ ...query, page, limit })}`;
    const cached = await this.cache.get<PaginatedResponse<MovieListItemDto>>(cacheKey);
    if (cached) {
      return cached;
    }

    const qb = this.repo
      .createQueryBuilder('movie')
      .leftJoin('movie.categories', 'category')
      .leftJoin('movie.genres', 'genre')
      .where('movie.status = :status', { status: MovieStatus.ACTIVE })
      .select([
        'movie.id',
        'movie.title',
        'movie.titleKh',
        'movie.slug',
        'movie.posterUrl',
        'movie.releaseYear',
        'movie.rating',
        'movie.type',
        'movie.status',
        'movie.createdAt',
      ]);

    if (query.search?.trim()) {
      qb.andWhere(
        '(movie.title ILIKE :search OR movie.titleKh ILIKE :search OR movie.description ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category });
    }
    if (query.genre) {
      qb.andWhere('genre.slug = :genre', { genre: query.genre });
    }
    if (query.country) {
      qb.andWhere('movie.country = :country', { country: query.country });
    }
    if (query.releaseYear) {
      qb.andWhere('movie.releaseYear = :releaseYear', { releaseYear: query.releaseYear });
    }
    if (query.type) {
      qb.andWhere('movie.type = :type', { type: query.type });
    }

    switch (query.sort ?? MovieSort.NEWEST) {
      case MovieSort.OLDEST:
        qb.orderBy('movie.createdAt', 'ASC');
        break;
      case MovieSort.RATING:
        qb.orderBy('movie.rating', 'DESC', 'NULLS LAST');
        break;
      case MovieSort.TITLE:
        qb.orderBy('movie.title', 'ASC');
        break;
      default:
        qb.orderBy('movie.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    const result: PaginatedResponse<MovieListItemDto> = {
      items: rows.map(toMovieListItem),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
    await this.cache.set(cacheKey, result, 300);
    return result;
  }

  async findFeatured(limit: number): Promise<MovieListItemDto[]> {
    const cacheKey = `movies:featured:${limit}`;
    const cached = await this.cache.get<MovieListItemDto[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const rows = await this.repo.find({
      where: { status: MovieStatus.ACTIVE, isFeatured: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    const items = rows.map(toMovieListItem);
    await this.cache.set(cacheKey, items, 300);
    return items;
  }

  async findTrending(limit: number): Promise<MovieListItemDto[]> {
    const cacheKey = `movies:trending:${limit}`;
    const cached = await this.cache.get<MovieListItemDto[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const rows = await this.repo.find({
      where: { status: MovieStatus.ACTIVE, isTrending: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    const items = rows.map(toMovieListItem);
    await this.cache.set(cacheKey, items, 300);
    return items;
  }

  async findById(id: string): Promise<MovieDetailDto> {
    const cacheKey = `movies:detail:id:${id}`;
    const cached = await this.cache.get<MovieDetailDto>(cacheKey);
    if (cached) {
      return cached;
    }
    const movie = await this.loadDetail({ id });
    const dto = toMovieDetail(movie);
    await this.cache.set(cacheKey, dto, 300);
    return dto;
  }

  async findBySlug(slug: string): Promise<MovieDetailDto> {
    const cacheKey = `movies:detail:slug:${slug}`;
    const cached = await this.cache.get<MovieDetailDto>(cacheKey);
    if (cached) {
      return cached;
    }
    const movie = await this.loadDetail({ slug });
    const dto = toMovieDetail(movie);
    await this.cache.set(cacheKey, dto, 300);
    return dto;
  }

  private async loadDetail(where: { id?: string; slug?: string }): Promise<MovieEntity> {
    const movie = await this.repo.findOne({
      where: { ...where, status: MovieStatus.ACTIVE },
      relations: ['categories', 'genres'],
    });
    if (!movie) {
      throw new NotFoundException({
        message: 'Movie not found',
        code: ErrorCodes.MOVIE_NOT_FOUND,
      });
    }
    return movie;
  }
}
