import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdminMovieDto, PaginatedResponse } from '@movie/types';
import { MAX_LIMIT } from '@movie/shared';
import { ErrorCodes } from '../../common/constants/error-codes';
import { CACHE_SERVICE, CacheService } from '../cache/cache.interface';
import { CategoryEntity } from '../categories/entities/category.entity';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { MovieEntity, MovieStatus } from '../movies/entities/movie.entity';
import { toAdminMovieDto } from './admin.mapper';
import { slugifyTitle } from './admin.util';
import { AdminMovieQueryDto } from './dto/admin-movie-query.dto';
import { CreateAdminMovieDto } from './dto/create-admin-movie.dto';
import { UpdateAdminMovieDto } from './dto/update-admin-movie.dto';

@Injectable()
export class AdminMoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly movies: Repository<MovieEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @Inject(CACHE_SERVICE)
    private readonly cache: CacheService,
  ) {}

  async list(query: AdminMovieQueryDto): Promise<PaginatedResponse<AdminMovieDto>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, MAX_LIMIT);
    const qb = this.movies.createQueryBuilder('movie').orderBy('movie.updatedAt', 'DESC');

    if (query.search?.trim()) {
      qb.andWhere('(movie.title ILIKE :q OR movie.slug ILIKE :q OR movie.titleKh ILIKE :q)', {
        q: `%${query.search.trim()}%`,
      });
    }
    if (query.status) {
      qb.andWhere('movie.status = :status', { status: query.status });
    }
    if (query.type) {
      qb.andWhere('movie.type = :type', { type: query.type });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();

    const counts = await this.episodeCounts(rows.map((m) => m.id));
    const items = rows.map((m) => toAdminMovieDto(m, counts.get(m.id) ?? 0));

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string): Promise<AdminMovieDto> {
    const movie = await this.movies.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!movie) {
      throw new NotFoundException({ message: 'Movie not found', code: ErrorCodes.MOVIE_NOT_FOUND });
    }
    const count = await this.episodes.count({ where: { movieId: id } });
    return toAdminMovieDto(movie, count);
  }

  async create(dto: CreateAdminMovieDto): Promise<AdminMovieDto> {
    const slug = await this.resolveUniqueSlug(dto.slug?.trim() || slugifyTitle(dto.title));
    const categories = await this.loadCategories(dto.categoryIds);

    const movie = this.movies.create({
      title: dto.title.trim(),
      titleKh: dto.titleKh?.trim() || null,
      slug,
      description: dto.description ?? null,
      descriptionKh: dto.descriptionKh ?? null,
      posterUrl: dto.posterUrl ?? null,
      backdropUrl: dto.backdropUrl ?? null,
      releaseYear: dto.releaseYear ?? null,
      durationMinutes: dto.durationMinutes ?? null,
      rating: dto.rating != null ? String(dto.rating) : null,
      country: dto.country ?? null,
      originalLanguage: dto.originalLanguage ?? null,
      type: dto.type,
      status: dto.status,
      isFeatured: dto.isFeatured ?? false,
      isTrending: dto.isTrending ?? false,
      publishedAt: dto.status === MovieStatus.ACTIVE ? new Date() : null,
      categories,
    });

    const saved = await this.movies.save(movie);
    await this.invalidateCatalogCache();
    return toAdminMovieDto(saved, 0);
  }

  async update(id: string, dto: UpdateAdminMovieDto): Promise<AdminMovieDto> {
    const movie = await this.movies.findOne({ where: { id }, relations: ['categories'] });
    if (!movie) {
      throw new NotFoundException({ message: 'Movie not found', code: ErrorCodes.MOVIE_NOT_FOUND });
    }

    if (dto.title != null) movie.title = dto.title.trim();
    if (dto.titleKh !== undefined) movie.titleKh = dto.titleKh?.trim() || null;
    if (dto.slug != null) {
      movie.slug = await this.resolveUniqueSlug(dto.slug.trim(), id);
    }
    if (dto.description !== undefined) movie.description = dto.description;
    if (dto.descriptionKh !== undefined) movie.descriptionKh = dto.descriptionKh;
    if (dto.posterUrl !== undefined) movie.posterUrl = dto.posterUrl;
    if (dto.backdropUrl !== undefined) movie.backdropUrl = dto.backdropUrl;
    if (dto.releaseYear !== undefined) movie.releaseYear = dto.releaseYear;
    if (dto.durationMinutes !== undefined) movie.durationMinutes = dto.durationMinutes;
    if (dto.rating !== undefined) movie.rating = dto.rating != null ? String(dto.rating) : null;
    if (dto.country !== undefined) movie.country = dto.country;
    if (dto.originalLanguage !== undefined) movie.originalLanguage = dto.originalLanguage;
    if (dto.type != null) movie.type = dto.type;
    if (dto.status != null) {
      movie.status = dto.status;
      if (dto.status === MovieStatus.ACTIVE && !movie.publishedAt) {
        movie.publishedAt = new Date();
      }
    }
    if (dto.isFeatured != null) movie.isFeatured = dto.isFeatured;
    if (dto.isTrending != null) movie.isTrending = dto.isTrending;
    if (dto.categoryIds != null) {
      movie.categories = await this.loadCategories(dto.categoryIds);
    }

    const saved = await this.movies.save(movie);
    await this.invalidateCatalogCache();
    const count = await this.episodes.count({ where: { movieId: id } });
    return toAdminMovieDto(saved, count);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.movies.delete(id);
    await this.invalidateCatalogCache();
    return { deleted: (result.affected ?? 0) > 0 };
  }

  private async resolveUniqueSlug(base: string, excludeId?: string): Promise<string> {
    if (!base) {
      throw new BadRequestException({ message: 'Slug is required', code: 'VALIDATION_ERROR' });
    }
    let slug = base;
    let n = 0;
    while (true) {
      const existing = await this.movies.findOne({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  private async loadCategories(ids?: string[]): Promise<CategoryEntity[]> {
    if (!ids?.length) return [];
    return this.categories.findBy({ id: In(ids) });
  }

  private async episodeCounts(movieIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (!movieIds.length) return map;
    const rows = await this.episodes
      .createQueryBuilder('e')
      .select('e.movieId', 'movieId')
      .addSelect('COUNT(*)', 'count')
      .where('e.movieId IN (:...ids)', { ids: movieIds })
      .groupBy('e.movieId')
      .getRawMany<{ movieId: string; count: string }>();
    for (const row of rows) {
      map.set(row.movieId, Number(row.count));
    }
    return map;
  }

  private async invalidateCatalogCache(): Promise<void> {
    await this.cache.clear();
  }
}
