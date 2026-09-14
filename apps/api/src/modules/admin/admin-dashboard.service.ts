import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminDashboardStatsDto } from '@movie/types';
import { CategoryEntity } from '../categories/entities/category.entity';
import { EpisodeEntity, EpisodeStatus } from '../episodes/entities/episode.entity';
import { MovieEntity, MovieStatus } from '../movies/entities/movie.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly movies: Repository<MovieEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
  ) {}

  async getStats(): Promise<AdminDashboardStatsDto> {
    const [moviesTotal, moviesActive, episodesTotal, episodesActive, categoriesTotal] =
      await Promise.all([
        this.movies.count(),
        this.movies.count({ where: { status: MovieStatus.ACTIVE } }),
        this.episodes.count(),
        this.episodes.count({ where: { status: EpisodeStatus.ACTIVE } }),
        this.categories.count(),
      ]);
    return {
      moviesTotal,
      moviesActive,
      episodesTotal,
      episodesActive,
      categoriesTotal,
    };
  }
}
