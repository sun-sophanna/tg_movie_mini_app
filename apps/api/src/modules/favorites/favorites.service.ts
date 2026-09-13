import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieListItemDto } from '@movie/types';
import { FavoriteEntity } from './entities/favorite.entity';
import { toMovieListItem } from '../movies/movie.mapper';
import { MovieStatus } from '../movies/entities/movie.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly repo: Repository<FavoriteEntity>,
  ) {}

  async list(userId: string): Promise<MovieListItemDto[]> {
    const rows = await this.repo.find({
      where: { userId },
      relations: ['movie'],
      order: { createdAt: 'DESC' },
    });
    return rows
      .filter((f) => f.movie && f.movie.status === MovieStatus.ACTIVE)
      .map((f) => toMovieListItem(f.movie));
  }

  async add(userId: string, movieId: string): Promise<{ added: boolean }> {
    const existing = await this.repo.findOne({ where: { userId, movieId } });
    if (existing) {
      return { added: false };
    }
    await this.repo.save(this.repo.create({ userId, movieId }));
    return { added: true };
  }

  async remove(userId: string, movieId: string): Promise<{ removed: boolean }> {
    const result = await this.repo.delete({ userId, movieId });
    return { removed: (result.affected ?? 0) > 0 };
  }
}
